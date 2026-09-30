'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { listUsers, createUser, updateUser, activeUserGuard } from '@/lib/data';
import { hashPassword, MIN_PASSWORD_LENGTH } from '@/lib/password';
import { nowStamp } from '@/lib/format';
import { requireSession } from '@/lib/auth';

export type FormState = { error?: string; success?: string } | null;

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,19}$/;

const USERNAME_HINT =
  'Username must be 3–20 characters: lowercase letters, digits, dot, dash or underscore.';

function fromError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function isRedirect(e: unknown): boolean {
  return Boolean(
    e &&
      typeof e === 'object' &&
      'digest' in e &&
      String((e as { digest?: unknown }).digest).startsWith('NEXT_REDIRECT')
  );
}

/**
 * Creates a sign-in account. Every account is an administrator — there is no
 * role to choose — but the `role` column is still filled in so a read-only
 * role could be added later without migrating data.
 *
 * This one keeps a read before the write, because the username has to be
 * checked for duplicates. Creating an account is rare, so the extra trip is
 * worth the guaranteed unique username.
 */
export async function createUserAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const session = await requireSession();

  const username = String(fd.get('username') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const full_name = String(fd.get('full_name') ?? '').trim();
  const phone = String(fd.get('phone') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim();

  if (!USERNAME_PATTERN.test(username)) return { error: USERNAME_HINT };
  if (!full_name) return { error: 'Full name is required.' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `The initial password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'That email address does not look right.' };
  }

  try {
    const taken = (await listUsers()).some((u) => u.username_lower === username);
    if (taken) return { error: `The username "${username}" is already taken.` };

    await createUser(
      {
        username,
        username_lower: username,
        password_hash: hashPassword(password),
        full_name,
        phone,
        email,
        role: 'admin',
        status: 'aktif',
        must_change_password: 'ya',
        created_at: nowStamp(),
        last_login: '',
      },
      activeUserGuard(session.userId)
    );
  } catch (e) {
    return { error: fromError(e) };
  }

  revalidatePath('/users');
  redirect('/users?msg=created');
}

export async function resetPasswordAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const session = await requireSession();

  const id = String(fd.get('id') ?? '').trim();
  const password = String(fd.get('password') ?? '');

  if (!id) return { error: 'User not found.' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `The password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  try {
    await updateUser(
      id,
      { password_hash: hashPassword(password), must_change_password: 'ya' },
      activeUserGuard(session.userId)
    );
  } catch (e) {
    return { error: fromError(e) };
  }

  revalidatePath('/users');
  redirect('/users?msg=password');
}

export async function toggleStatusAction(fd: FormData): Promise<void> {
  const session = await requireSession();

  const id = String(fd.get('id') ?? '').trim();
  const next = fd.get('status') === 'aktif' ? 'aktif' : 'nonaktif';

  if (!id) redirect('/users?e=notfound');

  // Switching off your own account would lock you out immediately.
  if (id === session.userId) redirect('/users?e=self');

  try {
    await updateUser(id, { status: next }, activeUserGuard(session.userId));
  } catch (e) {
    if (isRedirect(e)) throw e;
    redirect('/users?e=failed');
  }

  revalidatePath('/users');
  redirect('/users?msg=status');
}
