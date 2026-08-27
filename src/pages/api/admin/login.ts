import type { APIRoute } from 'astro';
import { checkPassword, sessionToken } from '../../../lib/admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const pw = String(form.get('password') ?? '');
  if (!checkPassword(pw)) return redirect('/manage/login?e=1');
  cookies.set('am_session', await sessionToken(), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 14,
  });
  return redirect('/manage');
};