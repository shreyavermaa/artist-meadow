import type { APIRoute } from 'astro';
import { isAuthed, adminSetStatus } from '../../../lib/admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!(await isAuthed(cookies))) return redirect('/manage/login');
  const form = await request.formData();
  const id = String(form.get('id') ?? '');
  const status = String(form.get('status') ?? '');
  if (id && (status === 'approved' || status === 'rejected')) {
    await adminSetStatus(id, status as 'approved' | 'rejected');
  }
  return redirect('/manage');
};