import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, readSessionToken, type Session } from './session';
import { listUsers } from './data';
import type { User } from './types';

/** Session straight from the cookie. No network call — fast. */
export async function currentSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

/** Session must exist, otherwise go to the sign-in page. */
export async function requireSession(): Promise<Session> {
  const session = await currentSession();
  if (!session) redirect('/login');
  return session;
}

/**
 * Session plus the freshest user record from the spreadsheet.
 * Used before every write, so an account that was just deactivated loses
 * access immediately even though its cookie is still valid.
 */
export async function requireActiveUser(): Promise<{ session: Session; user: User }> {
  const session = await requireSession();
  const user = (await listUsers()).find((u) => u.id === session.userId);
  if (!user || user.status !== 'aktif') redirect('/login?e=inactive');
  return { session, user };
}

/**
 * Note on roles: every sign-in account in this app is an administrator, so
 * there is no separate "admin only" gate. The `role` column still exists in the
 * spreadsheet and is always written as `admin`, so a read-only role could be
 * brought back later without touching the stored data.
 */
