import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request: NextRequest) {
  const dm = await draftMode();
  dm.disable();
  const redirectUrl = new URL('/', request.url);
  return NextResponse.redirect(redirectUrl);
}
