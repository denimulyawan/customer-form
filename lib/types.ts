/**
 * Data shapes shared across the app.
 *
 * Stored values (role / status / must_change_password) stay language-neutral
 * inside the spreadsheet; the UI renders English labels for them.
 */
export type Role = 'admin' | 'operator';
export type Status = 'aktif' | 'nonaktif';
export type YesNo = 'ya' | 'tidak';

/** One row in the `customers` tab. */
export type Customer = {
  id: string;
  /** Customer company name. */
  company_name: string;
  /** Customer ID. */
  cid: string;
  /** Username of the account being tracked. */
  account_username: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  /** Username of the app user who owns this account. */
  am_username: string;
  /** Recorded automatically; never shown in tables. */
  created_at: string;
};

/** Fields a person may fill in through the form. */
export type CustomerInput = Omit<Customer, 'id' | 'created_at'>;

/** One row in the `users` tab — an account that can sign in. */
export type User = {
  id: string;
  username: string;
  username_lower: string;
  password_hash: string;
  role: Role;
  status: Status;
  must_change_password: YesNo;
  created_at: string;
  last_login: string;
  full_name: string;
  phone: string;
  email: string;
};

/** Everything except the id, which the bridge generates. */
export type UserInput = Omit<User, 'id'>;

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  operator: 'Operator',
};

export const STATUS_LABEL: Record<Status, string> = {
  aktif: 'Active',
  nonaktif: 'Inactive',
};

/** Best human label for a user: full name when present, otherwise username. */
export function userLabel(u: Pick<User, 'full_name' | 'username'>): string {
  const nama = (u.full_name ?? '').trim();
  return nama || u.username || '—';
}
