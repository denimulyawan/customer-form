import { readTabs, appendRow, updateRow, removeRow } from './bridge';
import type { Customer, CustomerInput, User, UserInput } from './types';

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
  input: CustomerInput & { created_at: string }
): Promise<string> {
  const { id } = await appendRow('customers', { ...input });
  return id;
}

export async function updateCustomer(
  id: string,
  patch: Partial<CustomerInput>
): Promise<void> {
  await updateRow('customers', id, { ...patch } as Record<string, string>);
}

export async function deleteCustomer(id: string): Promise<void> {
  await removeRow('customers', id);
}

export async function createUser(input: UserInput): Promise<string> {
  const { id } = await appendRow('users', { ...input });
  return id;
}

export async function updateUser(id: string, patch: Partial<User>): Promise<void> {
  await updateRow('users', id, { ...patch } as Record<string, string>);
}

export async function deleteUser(id: string): Promise<void> {
  await removeRow('users', id);
}
