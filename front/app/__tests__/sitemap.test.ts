jest.mock('@/libs/microcms', () => ({
  getAllContentMeta: jest.fn(),
}));

import sitemap from '../sitemap';
import robots from '../robots';
import { getAllContentMeta } from '@/libs/microcms';
import { SITE_URL } from '@/constants';

const mockMeta = getAllContentMeta as jest.Mock;

const mockContents = () =>
  mockMeta.mockImplementation(async (endpoint: string) =>
    endpoint === 'blog'
      ? [
          {
            id: 'a1',
            updatedAt: '2026-11-02T00:00:00.000Z',
            publishedAt: '2026-11-01T00:00:00.000Z',
            tagIds: ['t1'],
          },
          { id: 'a2', publishedAt: '2026-11-03T00:00:00.000Z', tagIds: [] },
        ]
      : [
          { id: 't1', updatedAt: '2026-10-01T00:00:00.000Z' },
          // 公開記事が付いていないタグ。サイトマップには載らない。
          { id: 't-unused', updatedAt: '2026-10-02T00:00:00.000Z' },
        ],
  );

describe('sitemap', () => {
  const originalPhase = process.env.NEXT_PHASE;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalPhase === undefined) delete process.env.NEXT_PHASE;
    else process.env.NEXT_PHASE = originalPhase;
  });

  it('固定ページ・記事・タグを末尾スラッシュ付きで並べる', async () => {
    mockContents();

    const urls = (await sitemap()).map((e) => e.url);

    expect(urls).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/contact/`,
      `${SITE_URL}/disclosure/`,
      `${SITE_URL}/privacy-policy/`,
      `${SITE_URL}/articles/a1/`,
      `${SITE_URL}/articles/a2/`,
      `${SITE_URL}/tags/t1/`,
    ]);
    expect(urls.some((u) => /\/search|feed\.xml|\/p\//.test(u))).toBe(false);
  });

  it('公開記事が付いていないタグは載せない', async () => {
    mockContents();

    const urls = (await sitemap()).map((e) => e.url);

    expect(urls).toContain(`${SITE_URL}/tags/t1/`);
    expect(urls).not.toContain(`${SITE_URL}/tags/t-unused/`);
  });

  it('lastModified は updatedAt、無ければ publishedAt を使う', async () => {
    mockContents();

    const result = await sitemap();
    const find = (url: string) => result.find((e) => e.url === url);

    expect(find(`${SITE_URL}/articles/a1/`)?.lastModified).toEqual(
      new Date('2026-11-02T00:00:00.000Z'),
    );
    expect(find(`${SITE_URL}/articles/a2/`)?.lastModified).toEqual(
      new Date('2026-11-03T00:00:00.000Z'),
    );
    expect(find(`${SITE_URL}/tags/t1/`)?.lastModified).toEqual(
      new Date('2026-10-01T00:00:00.000Z'),
    );
  });

  it('ビルド中に取得失敗したら警告を出して固定ページだけを返す', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    mockMeta.mockRejectedValue(new Error('API Error'));

    const result = await sitemap();

    expect(result.map((e) => e.url)).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/contact/`,
      `${SITE_URL}/disclosure/`,
      `${SITE_URL}/privacy-policy/`,
    ]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('ビルド中に tags だけ失敗したら記事は残してタグだけ外す', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    mockMeta.mockImplementation(async (endpoint: string) => {
      if (endpoint === 'tags') throw new Error('API Error');
      return [{ id: 'a1', publishedAt: '2026-11-01T00:00:00.000Z' }];
    });

    const urls = (await sitemap()).map((e) => e.url);

    expect(urls).toContain(`${SITE_URL}/articles/a1/`);
    expect(urls.some((u) => u.includes('/tags/'))).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('ビルド中に blog だけ失敗したら、タグは絞らずに全部載せる', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    mockMeta.mockImplementation(async (endpoint: string) => {
      if (endpoint === 'blog') throw new Error('API Error');
      return [{ id: 't1' }, { id: 't-unused' }];
    });

    const urls = (await sitemap()).map((e) => e.url);

    expect(urls.some((u) => u.includes('/articles/'))).toBe(false);
    expect(urls).toContain(`${SITE_URL}/tags/t1/`);
    expect(urls).toContain(`${SITE_URL}/tags/t-unused/`);
    expect(console.warn).toHaveBeenCalled();
  });

  it('実行時に tags だけ失敗しても throw する', async () => {
    delete process.env.NEXT_PHASE;
    mockMeta.mockImplementation(async (endpoint: string) => {
      if (endpoint === 'tags') throw new Error('API Error');
      return [];
    });

    await expect(sitemap()).rejects.toThrow('API Error');
  });

  it('実行時に取得失敗したら throw する', async () => {
    delete process.env.NEXT_PHASE;
    mockMeta.mockRejectedValue(new Error('API Error'));

    await expect(sitemap()).rejects.toThrow('API Error');
  });
});

describe('robots', () => {
  it('allow / disallow / sitemap / host を返す', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: ['/search', '/api/'] },
      sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`],
      host: SITE_URL,
    });
  });
});
