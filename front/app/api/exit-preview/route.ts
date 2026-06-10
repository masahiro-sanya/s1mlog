import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { DRAFT_KEY_COOKIE } from '@/libs/preview';

export async function GET() {
  const dm = await draftMode();
  dm.disable();
  const cookieStore = await cookies();
  cookieStore.delete(DRAFT_KEY_COOKIE);
  redirect('/');
}
