'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  activeUserGuard,
} from '@/lib/data';
import { requireSession } from '@/lib/auth';
import { nowStamp } from '@/lib/format';
import { bridgeReady } from '@/lib/bridge';
import type { CustomerInput } from '@/lib/types';

export type FormState = { error?: string; success?: string } | null;

function fromError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function readForm(fd: FormData): CustomerInput {
  return {
    company_name: String(fd.get('company_name') ?? '').trim(),
    cid: String(fd.get('cid') ?? '').trim(),
    account_username: String(fd.get('account_username') ?? '').trim(),
    pic_name: String(fd.get('pic_name') ?? '').trim(),
    pic_phone: String(fd.get('pic_phone') ?? '').trim(),
    pic_email: String(fd.get('pic_email') ?? '').trim(),
    am_username: String(fd.get('am_username') ?? '').trim(),
  };
}

function validate(input: CustomerInput): string | null {
  if (!input.company_name) return 'Customer company name is required.';
  if (!input.cid) return 'CID is required.';
  if (!input.account_username) return 'Account username is required.';
  if (!input.am_username) return 'Please pick an Account Manager.';
  if (input.pic_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.pic_email)) {
    return 'The PIC email address does not look right.';
  }
  return null;
}

/**
 * Note on speed: the session comes from the cookie, which costs nothing. The
 * "is this account still active?" check travels WITH the write as a guard, so
 * saving is a single trip to Google instead of two.
 */
export async function createCustomerAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const session = await requireSession();
  if (!bridgeReady()) return { error: 'Configuration is incomplete.' };

  const input = readForm(fd);
  const invalid = validate(input);
  if (invalid) return { error: invalid };

  try {
    await createCustomer(
      { ...input, created_at: nowStamp() },
      activeUserGuard(session.userId)
    );
  } catch (e) {
    return { error: fromError(e) };
  }

  revalidatePath('/');
  revalidatePath('/customers');
  redirect('/customers?msg=created');
}

export async function updateCustomerAction(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const session = await requireSession();
  if (!bridgeReady()) return { error: 'Configuration is incomplete.' };

  const id = String(fd.get('id') ?? '').trim();
  if (!id) return { error: 'Record id is missing.' };

  const input = readForm(fd);
  const invalid = validate(input);
  if (invalid) return { error: invalid };

  try {
    await updateCustomer(id, input, activeUserGuard(session.userId));
  } catch (e) {
    return { error: fromError(e) };
  }

  revalidatePath('/');
  revalidatePath('/customers');
  redirect('/customers?msg=saved');
}

/** Called from the delete button, after its confirmation dialog. */
export async function deleteCustomerAction(id: string): Promise<void> {
  const session = await requireSession();
  await deleteCustomer(id, activeUserGuard(session.userId));
  revalidatePath('/');
  revalidatePath('/customers');
}
