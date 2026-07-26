/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { DRAFT_KEY_COOKIE } from '@/libs/preview';

const mockGetListDetail = jest.fn();
const mockEnable = jest.fn();
const mockCookieSet = jest.fn();
const mockRedirect = jest.fn();

jest.mock('@/libs/microcms', () => ({
  client: {
    getListDetail: (...args: unknown[]) => mockGetListDetail(...args),
  },
}));

jest.mock('next/headers', () => ({
  draftMode: async () => ({ enable: mockEnable }),
  cookies: async () => ({ set: mockCookieSet }),
}));

// jest.setup.js の next/navigation モックには redirect が無いため、このファイルで上書きする
jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

import { GET } from '../route';

const buildRequest = (query: string) =>
  new NextRequest(`http://localhost:3000/api/preview${query}`);

describe('GET /api/preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetListDetail.mockResolvedValue({ id: 'article-1' });
  });

  describe('パラメータ不足', () => {
    it('contentId が無ければ 400 を返す', async () => {
      const res = await GET(buildRequest('?draftKey=abc123'));

      expect(res?.status).toBe(400);
      expect(mockGetListDetail).not.toHaveBeenCalled();
      expect(mockEnable).not.toHaveBeenCalled();
    });

    it('draftKey が無ければ 400 を返す', async () => {
      const res = await GET(buildRequest('?contentId=article-1'));

      expect(res?.status).toBe(400);
      expect(mockGetListDetail).not.toHaveBeenCalled();
      expect(mockEnable).not.toHaveBeenCalled();
    });
  });

  describe('入力の形式チェック', () => {
    // microCMS へ問い合わせる前に弾き、クォータ消費と存在確認オラクル化を防ぐ
    it.each([
      ['記号を含む contentId', '?contentId=../../etc/passwd&draftKey=abc123'],
      ['空白を含む draftKey', '?contentId=article-1&draftKey=abc%20123'],
      ['64文字を超える contentId', `?contentId=${'a'.repeat(65)}&draftKey=abc123`],
      ['64文字を超える draftKey', `?contentId=article-1&draftKey=${'a'.repeat(65)}`],
    ])('%s は microCMS を呼ばずに 401 を返す', async (_name, query) => {
      const res = await GET(buildRequest(query));

      expect(res?.status).toBe(401);
      expect(mockGetListDetail).not.toHaveBeenCalled();
      expect(mockEnable).not.toHaveBeenCalled();
    });
  });

  describe('draftKey の検証', () => {
    it('microCMS が失敗したら 401 を返し Draft Mode を有効化しない', async () => {
      mockGetListDetail.mockRejectedValue(new Error('404 Not Found'));

      const res = await GET(buildRequest('?contentId=article-1&draftKey=abc123'));

      expect(res?.status).toBe(401);
      expect(mockEnable).not.toHaveBeenCalled();
      expect(mockCookieSet).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('検証時に contentId と draftKey を microCMS へ渡す', async () => {
      await GET(buildRequest('?contentId=article-1&draftKey=abc123'));

      expect(mockGetListDetail).toHaveBeenCalledWith({
        endpoint: 'blog',
        contentId: 'article-1',
        queries: { draftKey: 'abc123' },
      });
    });
  });

  describe('検証に成功した場合', () => {
    it('Draft Mode を有効化し、記事ページへリダイレクトする', async () => {
      await GET(buildRequest('?contentId=article-1&draftKey=abc123'));

      expect(mockEnable).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/articles/article-1/');
    });

    it('draftKey を httpOnly cookie に保存する（URL には載せない）', async () => {
      await GET(buildRequest('?contentId=article-1&draftKey=abc123'));

      expect(mockCookieSet).toHaveBeenCalledWith(
        DRAFT_KEY_COOKIE,
        'abc123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
    });

    it('本番環境では cookie に secure を付ける', async () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');

      await GET(buildRequest('?contentId=article-1&draftKey=abc123'));

      expect(mockCookieSet).toHaveBeenCalledWith(
        DRAFT_KEY_COOKIE,
        'abc123',
        expect.objectContaining({ secure: true }),
      );
    });
  });
});
