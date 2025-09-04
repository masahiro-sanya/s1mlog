import { notFound } from 'next/navigation';

// microcms-js-sdkのモック
jest.mock('microcms-js-sdk', () => {
  const mockGetList = jest.fn();
  const mockGetListDetail = jest.fn();
  const mockGet = jest.fn();
  
  return {
    createClient: jest.fn(() => ({
      getList: mockGetList,
      getListDetail: mockGetListDetail,
      get: mockGet,
    })),
  };
});

// テスト対象をモック設定後にインポート
import { getList, getDetail, getTagList, getTag, getWriter, client } from '../microcms';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

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
        queries: undefined,
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
        queries,
      });
    });

    it('エラー時は空の結果を返す', async () => {
      const mockClient = getMockClient();
      mockClient.getList.mockRejectedValue(new Error('API Error'));

      const result = await getList();

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching blog list:',
        expect.any(Error),
      );
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
        id: '1',
        title: 'Test Blog',
        content: 'Content',
      };

      const mockClient = getMockClient();
      mockClient.getListDetail.mockResolvedValue(mockDetail);

      const result = await getDetail('1');

      expect(mockClient.getListDetail).toHaveBeenCalledWith({
        endpoint: 'blog',
        contentId: '1',
        queries: undefined,
      });
      expect(result).toEqual(mockDetail);
    });

    it('エラー時はnotFoundを呼ぶ', async () => {
      const mockClient = getMockClient();
      mockClient.getListDetail.mockRejectedValue(new Error('Not found'));

      await getDetail('invalid-id');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching blog detail (invalid-id):',
        expect.any(Error),
      );
      expect(notFound).toHaveBeenCalled();
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

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching tag list:',
        expect.any(Error),
      );
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
        id: 'tag1',
        name: 'JavaScript',
      };

      const mockClient = getMockClient();
      mockClient.getListDetail.mockResolvedValue(mockTag);

      const result = await getTag('tag1');

      expect(mockClient.getListDetail).toHaveBeenCalledWith({
        endpoint: 'tags',
        contentId: 'tag1',
        queries: undefined,
      });
      expect(result).toEqual(mockTag);
    });

    it('エラー時はnotFoundを呼ぶ', async () => {
      const mockClient = getMockClient();
      mockClient.getListDetail.mockRejectedValue(new Error('Not found'));

      await getTag('invalid-tag');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching tag detail (invalid-tag):',
        expect.any(Error),
      );
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('getWriter', () => {
    it('ライター情報を正常に取得できる', async () => {
      const mockWriter = {
        id: 'writer1',
        name: 'Test Writer',
        profile: 'Profile text',
      };

      const mockClient = getMockClient();
      mockClient.get.mockResolvedValue({
        contents: [mockWriter],
      });

      const result = await getWriter();

      expect(mockClient.get).toHaveBeenCalledWith({
        endpoint: 'writers',
      });
      expect(result).toEqual(mockWriter);
    });

    it('エラー時はデフォルトのライター情報を返す', async () => {
      const mockClient = getMockClient();
      mockClient.get.mockRejectedValue(new Error('API Error'));

      const result = await getWriter();

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching writers:',
        expect.any(Error),
      );
      expect(result).toEqual({
        id: 'default',
        name: 'Default Writer',
        profile: 'No profile available',
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      });
    });

    it('空の結果の場合はundefinedを返す', async () => {
      const mockClient = getMockClient();
      mockClient.get.mockResolvedValue({
        contents: [],
      });

      const result = await getWriter();

      expect(result).toBeUndefined();
    });
  });
});