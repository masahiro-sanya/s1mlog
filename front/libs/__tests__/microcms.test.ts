// microcms-js-sdkのモック
jest.mock('microcms-js-sdk', () => {
  const mockGetList = jest.fn();
  const mockGetListDetail = jest.fn();

  return {
    createClient: jest.fn(() => ({
      getList: mockGetList,
      getListDetail: mockGetListDetail,
    })),
  };
});

// テスト対象をモック設定後にインポート
import {
  getList,
  getDetail,
  getTagList,
  getTag,
  getWriter,
  getAllContentIds,
  client,
} from '../microcms';

describe('microCMS API', () => {
  // モック関数にアクセスするためのヘルパー
  const getMockClient = () => client as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getList', () => {
    it('ブログリストを正常に取得できる', async () => {
      const mockData = {
        contents: [
          { id: '1', title: 'Test Blog 1' },
          { id: '2', title: 'Test Blog 2' },
        ],
        totalCount: 2,
        offset: 0,
        limit: 10,
      };

      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue(mockData);

      const result = await getList();

      expect(mockClient.getList).toHaveBeenCalledWith({
        endpoint: 'blog',
        queries: { filters: 'publishedAt[exists]' },
      });
      expect(result).toEqual(mockData);
    });

    it('クエリパラメータを渡せる', async () => {
      const queries = { limit: 5, offset: 10 };
      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue({ contents: [] });

      await getList(queries);

      expect(mockClient.getList).toHaveBeenCalledWith({
        endpoint: 'blog',
        queries: { ...queries, filters: 'publishedAt[exists]' },
      });
    });

    it('ユーザー指定の filters は publishedAt[exists] と AND 結合される', async () => {
      const queries = { filters: 'tags[contains]tag1' };
      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue({ contents: [] });

      await getList(queries);

      expect(mockClient.getList).toHaveBeenCalledWith({
        endpoint: 'blog',
        queries: { filters: 'publishedAt[exists][and]tags[contains]tag1' },
      });
    });

    it('エラー時は空の結果を返す', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockRejectedValue(new Error('API Error'));

      const result = await getList();

      expect(console.error).toHaveBeenCalledWith('Error fetching blog list:', expect.any(Error));
      expect(result).toEqual({
        contents: [],
        totalCount: 0,
        offset: 0,
        limit: 0,
      });
    });
  });

  describe('getDetail', () => {
    it('ブログ詳細を正常に取得できる', async () => {
      const mockDetail = {
        id: 'detail-ok',
        title: 'Test Blog',
        content: 'Content',
      };

      const mockClient = getMockClient();
      mockClient.getListDetail.mockResolvedValue(mockDetail);

      const result = await getDetail('detail-ok');

      expect(mockClient.getListDetail).toHaveBeenCalledWith({
        endpoint: 'blog',
        contentId: 'detail-ok',
        queries: undefined,
      });
      expect(result).toEqual(mockDetail);
    });

    it('draftKey などのクエリを渡せる', async () => {
      const mockClient = getMockClient();
      mockClient.getListDetail.mockResolvedValue({ id: 'detail-draft' });

      await getDetail('detail-draft', { draftKey: 'abc' });

      expect(mockClient.getListDetail).toHaveBeenCalledWith({
        endpoint: 'blog',
        contentId: 'detail-draft',
        queries: { draftKey: 'abc' },
      });
    });

    it('エラー時は null を返す（404 判断は呼び出し側）', async () => {
      const mockClient = getMockClient();
      mockClient.getListDetail.mockRejectedValue(new Error('Not found'));

      const result = await getDetail('invalid-id');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching blog detail (invalid-id):',
        expect.any(Error),
      );
      expect(result).toBeNull();
    });
  });

  describe('getTagList', () => {
    it('タグリストを正常に取得できる', async () => {
      const mockTags = {
        contents: [
          { id: 'tag1', name: 'JavaScript' },
          { id: 'tag2', name: 'React' },
        ],
        totalCount: 2,
        offset: 0,
        limit: 10,
      };

      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue(mockTags);

      const result = await getTagList();

      expect(mockClient.getList).toHaveBeenCalledWith({
        endpoint: 'tags',
        queries: undefined,
      });
      expect(result).toEqual(mockTags);
    });

    it('エラー時は空の結果を返す', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockRejectedValue(new Error('API Error'));

      const result = await getTagList();

      expect(console.error).toHaveBeenCalledWith('Error fetching tag list:', expect.any(Error));
      expect(result).toEqual({
        contents: [],
        totalCount: 0,
        offset: 0,
        limit: 0,
      });
    });
  });

  describe('getTag', () => {
    it('タグ詳細を正常に取得できる', async () => {
      const mockTag = {
        id: 'tag-ok',
        name: 'JavaScript',
      };

      const mockClient = getMockClient();
      mockClient.getListDetail.mockResolvedValue(mockTag);

      const result = await getTag('tag-ok');

      expect(mockClient.getListDetail).toHaveBeenCalledWith({
        endpoint: 'tags',
        contentId: 'tag-ok',
        queries: undefined,
      });
      expect(result).toEqual(mockTag);
    });

    it('エラー時は null を返す（404 判断は呼び出し側）', async () => {
      const mockClient = getMockClient();
      mockClient.getListDetail.mockRejectedValue(new Error('Not found'));

      const result = await getTag('invalid-tag');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching tag detail (invalid-tag):',
        expect.any(Error),
      );
      expect(result).toBeNull();
    });
  });

  describe('getWriter', () => {
    it('ライター情報（先頭の1件）を正常に取得できる', async () => {
      const mockWriter = {
        id: 'writer1',
        name: 'Test Writer',
        profile: 'Profile text',
      };

      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue({
        contents: [mockWriter],
        totalCount: 1,
        offset: 0,
        limit: 1,
      });

      const result = await getWriter();

      expect(mockClient.getList).toHaveBeenCalledWith({
        endpoint: 'writers',
        queries: { limit: 1 },
      });
      expect(result).toEqual(mockWriter);
    });

    it('エラー時はデフォルトのライター情報を返す', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockRejectedValue(new Error('API Error'));

      const result = await getWriter();

      expect(console.error).toHaveBeenCalledWith('Error fetching writers:', expect.any(Error));
      expect(result).toEqual({
        id: 'default',
        name: 'Default Writer',
        profile: 'No profile available',
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      });
    });

    it('空の結果の場合は null を返す', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue({
        contents: [],
        totalCount: 0,
        offset: 0,
        limit: 1,
      });

      const result = await getWriter();

      expect(result).toBeNull();
    });
  });

  describe('getAllContentIds', () => {
    it('100件を超えるコンテンツをページングして全件取得する', async () => {
      const page1 = Array.from({ length: 100 }, (_, i) => ({ id: `id-${i}` }));
      const page2 = Array.from({ length: 50 }, (_, i) => ({ id: `id-${100 + i}` }));

      const mockClient = getMockClient();
      mockClient.getList
        .mockResolvedValueOnce({ contents: page1, totalCount: 150, offset: 0, limit: 100 })
        .mockResolvedValueOnce({ contents: page2, totalCount: 150, offset: 100, limit: 100 });

      const result = await getAllContentIds('blog');

      expect(result).toHaveLength(150);
      expect(result[0]).toBe('id-0');
      expect(result[149]).toBe('id-149');
      expect(mockClient.getList).toHaveBeenCalledTimes(2);
      expect(mockClient.getList).toHaveBeenNthCalledWith(1, {
        endpoint: 'blog',
        queries: {
          fields: 'id',
          limit: 100,
          offset: 0,
          filters: 'publishedAt[exists]',
        },
      });
      expect(mockClient.getList).toHaveBeenNthCalledWith(2, {
        endpoint: 'blog',
        queries: {
          fields: 'id',
          limit: 100,
          offset: 100,
          filters: 'publishedAt[exists]',
        },
      });
    });

    it('tags エンドポイントでは publishedAt フィルタを付けない', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockResolvedValue({
        contents: [{ id: 'tag1' }],
        totalCount: 1,
        offset: 0,
        limit: 100,
      });

      const result = await getAllContentIds('tags');

      expect(result).toEqual(['tag1']);
      expect(mockClient.getList).toHaveBeenCalledWith({
        endpoint: 'tags',
        queries: { fields: 'id', limit: 100, offset: 0 },
      });
    });

    it('エラー時は空配列を返す', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockRejectedValue(new Error('API Error'));

      const result = await getAllContentIds('blog');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching all content ids (blog):',
        expect.any(Error),
      );
      expect(result).toEqual([]);
    });
  });
});
