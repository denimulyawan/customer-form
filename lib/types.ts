export type Role = 'admin' | 'operator';
export type Status = 'aktif' | 'nonaktif';
export type YaTidak = 'ya' | 'tidak';

/** Satu baris di tab `akun`. */
export type Akun = {
  id: string;
  nama_pelanggan: string;
  username: string;
  email_solarwinds: string;
  email_duo: string;
  pic: string;
  /** Tanggal input, format teks YYYY-MM-DD. */
  tanggal_input: string;
};

/** Satu baris di tab `users` — akun untuk login ke aplikasi. */
export type User = {
  id: string;
  username: string;
  username_lower: string;
  password_hash: string;
  role: Role;
  status: Status;
  must_change_password: YaTidak;
  created_at: string;
  last_login: string;
};

/** Isi kolom yang boleh diubah dari aplikasi. */
export type AkunInput = Omit<Akun, 'id'>;

export const LABEL_AKUN: Record<keyof AkunInput, string> = {
  nama_pelanggan: 'Nama Pelanggan',
  username: 'Username',
  email_solarwinds: 'Email SolarWinds',
  email_duo: 'Email Duo',
  pic: 'PIC',
  tanggal_input: 'Tanggal Input',
};

/** Judul kolom untuk file Excel. */
export const JUDUL_EXCEL = LABEL_AKUN;
