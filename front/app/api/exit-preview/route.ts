import { NextRequest, NextResponse } from 'next/server';
import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { DRAFT_KEY_COOKIE } from '@/libs/preview';

export async function GET(request: NextRequest) {
  // クロスサイトからの状態変更（CSRF）を防ぐ。第三者ページの <img src> 等は
  // Sec-Fetch-Site: cross-site を伴うため拒否する（同一サイトのリンク/直接アクセスは許可）。
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const dm = await draftMode();
  dm.disable();
  const cookieStore = await cookies();
  cookieStore.delete(DRAFT_KEY_COOKIE);
  redirect('/');
}
