import { readTabs, appendRow, updateRow, removeRow, type WriteGuard } from './bridge';
import type { Customer, CustomerInput, User, UserInput } from './types';

/**
 * The permission that every write carries with it: "the account making this
 * change must still be active". Checked by the script in the same call, so
 * saving costs one trip to Google instead of two.
 */
export function activeUserGuard(userId: string): WriteGuard {
  return { sheet: 'users', id: userId, expect: { status: 'aktif' } };
}

export async function listCustomers(): Promise<Customer[]> {
  const isi = await readTabs(['customers']);
  return (isi.customers ?? []) as Customer[];
}

export async function listUsers(): Promise<User[]> {
  const isi = await readTabs(['users']);
  return (isi.users ?? []) as User[];
}

/** Both tabs at once — one round trip to the bridge. */
export async function loadBoth(): Promise<{ customers: Customer[]; users: User[] }> {
  const isi = await readTabs(['customers', 'users']);
  return {
    customers: (isi.customers ?? []) as Customer[],
    users: (isi.users ?? []) as User[],
  };
}

export async function createCustomer(
  input: CustomerInput & { created_at: string },
  guard?: WriteGuard
): Promise<string> {
  const { id } = await appendRow('customers', { ...input }, guard);
  return id;
}

export async function updateCustomer(
  id: string,
  patch: Partial<CustomerInput>,
  guard?: WriteGuard
): Promise<void> {
  await updateRow('customers', id, { ...patch } as Record<string, string>, guard);
}

export async function deleteCustomer(id: string, guard?: WriteGuard): Promise<void> {
  await removeRow('customers', id, guard);
}

export async function createUser(input: UserInput, guard?: WriteGuard): Promise<string> {
  const { id } = await appendRow('users', { ...input }, guard);
  return id;
}

export async function updateUser(
  id: string,
  patch: Partial<User>,
  guard?: WriteGuard
): Promise<void> {
  await updateRow('users', id, { ...patch } as Record<string, string>, guard);
}

export async function deleteUser(id: string, guard?: WriteGuard): Promise<void> {
  await removeRow('users', id, guard);
}
