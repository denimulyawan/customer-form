'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { listUsers, createUser, updateUser } from '@/lib/data';
import { hashPassword, verifyPassword, MIN_PASSWORD_LENGTH } from '@/lib/password';
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from '@/lib/session';
import { nowStamp } from '@/lib/format';
import { bridgeReady } from '@/lib/bridge';
import { requireSession } from '@/lib/auth';

export type FormState = { error?: string; success?: string } | null;

const CONFIG_MESSAGE =
  'Configuration is incomplete. Set BRIDGE_URL, BRIDGE_TOKEN and AUTH_SECRET in ' +
  'Vercel, then redeploy.';

/** Temporary lock-out after repeated failed sign-ins. */
const MAX_FAILURES = 8;
const LOCK_MINUTES = 5;

/**
 * A small in-memory counter to slow down password guessing.
 * Per Vercel instance; enough to stop casual brute force.
 */
const failures = new Map<string, { count: number; until: number }>();

function lockedFor(key: string): number {
  const entry = failures.get(key);
  if (!entry) return 0;
  if (entry.count >= MAX_FAILURES && Date.now() < entry.until) {
    return Math.ceil((entry.until - Date.now()) / 60000);
  }
  if (Date.now() >= entry.until) failures.delete(key);
  return 0;
}

function noteFailure(key: string) {
  const entry = failures.get(key) ?? { count: 0, until: 0 };
  entry.count += 1;
  entry.until = Date.now() + LOCK_MINUTES * 60000;
  failures.set(key, entry);
}

/* ============================== Sign in ============================== */

export async function signInAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!bridgeReady()) return { error: CONFIG_MESSAGE };

  const username = String(fd.get('username') ?? '').trim();
  const password = String(fd.get('password') ?? '');

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  const key = username.toLowerCase();
  const locked = lockedFor(key);
  if (locked > 0) {
    return { error: `Too many failed attempts. Try again in ${locked} minute(s).` };
  }

  let user;
  try {
    user = (await listUsers()).find((u) => u.username_lower === key);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  // Same wording either way, so we never reveal which usernames exist.
  if (!user || !verifyPassword(password, user.password_hash)) {
    noteFailure(key);
    return { error: 'Incorrect username or password.' };
  }

  if (user.status !== 'aktif') {
    return { error: 'This account is deactivated. Please contact your admin.' };
  }

  failures.delete(key);

  const mustChange = user.must_change_password === 'ya';

  const c = await cookies();
  c.set(
    SESSION_COOKIE,
    await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword: mustChange,
    }),
    sessionCookieOptions()
  );

  // Recording the sign-in time must never break the sign-in itself.
  try {
    await updateUser(user.id, { last_login: nowStamp() });
  } catch {
    /* ignored */
  }

  redirect(mustChange ? '/set-password' : '/');
}

export async function signOutAction(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  redirect('/login');
}

/* ============================== My account ============================== */

export async function updateProfileAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const session = await requireSession();

  const full_name = String(fd.get('full_name') ?? '').trim();
  const phone = String(fd.get('phone') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim();

  if (!full_name) return { error: 'Full name is required.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'That email address does not look right.' };
  }

  try {
    await updateUser(session.userId, { full_name, phone, email });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  return { success: 'Your details have been saved.' };
}

export async function changePasswordAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const session = await requireSession();

  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next') ?? '');
  const repeat = String(fd.get('repeat') ?? '');

  let user;
  try {
    user = (await listUsers()).find((u) => u.id === session.userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  if (!user) return { error: 'Account not found.' };
  if (!verifyPassword(current, user.password_hash)) {
    return { error: 'Your current password is incorrect.' };
  }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (next !== repeat) return { error: 'The repeated password does not match.' };
  if (next === current) {
    return { error: 'The new password must be different from the current one.' };
  }

  try {
    await updateUser(user.id, {
      password_hash: hashPassword(next),
      must_change_password: 'tidak',
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  const c = await cookies();
  c.set(
    SESSION_COOKIE,
    await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword: false,
    }),
    sessionCookieOptions()
  );

  return { success: 'Your password has been changed.' };
}

/* ====================== First run / lock-out recovery ====================== */

/**
 * Only reachable while the `users` tab is completely empty, so it can never be
 * used while a real account exists. It exists purely so an empty spreadsheet
 * is not a dead end.
 */
export async function createFirstAdminAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  if (!bridgeReady()) return { error: CONFIG_MESSAGE };

  const username = String(fd.get('username') ?? '').trim().toLowerCase();
  const full_name = String(fd.get('full_name') ?? '').trim();
  const password = String(fd.get('password') ?? '');
  const repeat = String(fd.get('repeat') ?? '');

  if (!/^[a-z0-9][a-z0-9._-]{2,19}$/.test(username)) {
    return {
      error:
        'Username must be 3–20 characters, lowercase letters, digits, dot, dash or underscore.',
    };
  }
  if (!full_name) return { error: 'Full name is required.' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password !== repeat) return { error: 'The repeated password does not match.' };

  let count;
  try {
    count = (await listUsers()).length;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  if (count > 0) {
    return { error: 'An account already exists, so this page can no longer be used.' };
  }

  try {
    await createUser({
      username,
      username_lower: username,
      password_hash: hashPassword(password),
      full_name,
      phone: '',
      email: '',
      role: 'admin',
      status: 'aktif',
      must_change_password: 'tidak',
      created_at: nowStamp(),
      last_login: '',
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  redirect('/login?msg=created');
}
