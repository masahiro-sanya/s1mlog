import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { client } from '@/libs/microcms';
import type { Blog } from '@/libs/microcms';

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

  // Draft Modeを有効化し、対象記事へリダイレクト
  const dm = await draftMode();
  dm.enable();
  const redirectUrl = new URL(`/articles/${contentId}?draftKey=${draftKey}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
