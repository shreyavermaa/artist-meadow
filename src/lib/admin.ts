// Server-only admin helpers. Uses the SECRET service-role key (never exposed to
// the browser) to see pending artists + inquiries and to approve/reject.

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const sr = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const adminPassword = import.meta.env.ADMIN_PASSWORD as string | undefined;

/** True once the service-role key is present (admin can read/write all rows). */
export const adminReady = Boolean(url && sr);
/** True once an admin password is set. */
export const authConfigured = Boolean(adminPassword);

function h() {
  return { apikey: sr as string, Authorization: `Bearer ${sr}` };
}

export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode('artist-meadow::' + (adminPassword ?? ''));
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function checkPassword(pw: string): boolean {
  return Boolean(adminPassword) && pw === adminPassword;
}

type Cookies = { get: (n: string) => { value: string } | undefined };
export async function isAuthed(cookies: Cookies): Promise<boolean> {
  const c = cookies.get('am_session')?.value;
  if (!c) return false;
  return c === (await sessionToken());
}

export async function adminListPending(): Promise<any[]> {
  if (!adminReady) return [];
  const res = await fetch(`${url}/rest/v1/artists?status=eq.pending&select=*&order=created_at.desc`, { headers: h() });
  return res.ok ? await res.json() : [];
}

export async function adminSetStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  if (!adminReady) return false;
  const res = await fetch(`${url}/rest/v1/artists?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...h(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}

export async function adminListInquiries(): Promise<any[]> {
  if (!adminReady) return [];
  const res = await fetch(`${url}/rest/v1/inquiries?select=*&order=created_at.desc`, { headers: h() });
  return res.ok ? await res.json() : [];
}
