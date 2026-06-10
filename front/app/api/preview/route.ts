import { NextRequest, NextResponse } from 'next/server';
import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { client } from '@/libs/microcms';
import type { Blog } from '@/libs/microcms';
import { DRAFT_KEY_COOKIE } from '@/libs/preview';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get('contentId');
  const draftKey = searchParams.get('draftKey');

  if (!contentId || !draftKey) {
    return new NextResponse('Missing contentId or draftKey', { status: 400 });
  }

  // ドラフトキーの検証（存在しない/不正なら401）
  try {
    await client.getListDetail<Blog>({ endpoint: 'blog', contentId, queries: { draftKey } });
  } catch {
    return new NextResponse('Invalid draftKey or contentId', { status: 401 });
  }

  // Draft Mode を有効化。draftKey は cookie に保持し、URL には載せない
  // （アクセスログ・ブラウザ履歴・Referer への漏えいを防ぐ）
  const dm = await draftMode();
  dm.enable();
  const cookieStore = await cookies();
  cookieStore.set(DRAFT_KEY_COOKIE, draftKey, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  redirect(`/articles/${contentId}/`);
}
