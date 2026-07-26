/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { DRAFT_KEY_COOKIE } from '@/libs/preview';

const mockDisable = jest.fn();
const mockCookieDelete = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/headers', () => ({
  draftMode: async () => ({ disable: mockDisable }),
  cookies: async () => ({ delete: mockCookieDelete }),
}));

// jest.setup.js の next/navigation モックには redirect が無いため、このファイルで上書きする
jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

import { GET } from '../route';

const buildRequest = (headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost:3000/api/exit-preview', { headers });

describe('GET /api/exit-preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クロスサイトからの呼び出しは 403 で拒否する（CSRF 対策）', async () => {
    const res = await GET(buildRequest({ 'sec-fetch-site': 'cross-site' }));

    expect(res?.status).toBe(403);
    expect(mockDisable).not.toHaveBeenCalled();
    expect(mockCookieDelete).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it.each(['same-origin', 'same-site', 'none'])(
    'Sec-Fetch-Site: %s は許可して Draft Mode を解除する',
    async (site) => {
      await GET(buildRequest({ 'sec-fetch-site': site }));

      expect(mockDisable).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/');
    },
  );

  it('Sec-Fetch-Site ヘッダが無い場合（直接アクセス）も解除できる', async () => {
    await GET(buildRequest());

    expect(mockDisable).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('draftKey cookie を削除する', async () => {
    await GET(buildRequest({ 'sec-fetch-site': 'same-origin' }));

    expect(mockCookieDelete).toHaveBeenCalledWith(DRAFT_KEY_COOKIE);
  });
});
