import { ambilTab, tambahBaris, ubahBaris, hapusBaris } from './bridge';
import type { Akun, User } from './types';

export async function daftarAkun(): Promise<Akun[]> {
  const isi = await ambilTab(['akun']);
  return (isi.akun ?? []) as Akun[];
}

export async function daftarPengguna(): Promise<User[]> {
  const isi = await ambilTab(['users']);
  return (isi.users ?? []) as User[];
}

/** Ambil dua tab sekaligus — satu kali perjalanan ke jembatan. */
export async function daftarAkunDanPengguna(): Promise<{
  akun: Akun[];
  pengguna: User[];
}> {
  const isi = await ambilTab(['akun', 'users']);
  return {
    akun: (isi.akun ?? []) as Akun[],
    pengguna: (isi.users ?? []) as User[],
  };
}

export async function simpanAkunBaru(input: Omit<Akun, 'id'>): Promise<string> {
  const { id } = await tambahBaris('akun', { ...input });
  return id;
}

export async function perbaruiAkun(
  id: string,
  patch: Partial<Omit<Akun, 'id'>>
): Promise<void> {
  await ubahBaris('akun', id, { ...patch } as Record<string, string>);
}

export async function buangAkun(id: string): Promise<void> {
  await hapusBaris('akun', id);
}

export async function simpanPenggunaBaru(
  input: Omit<User, 'id'>
): Promise<string> {
  const { id } = await tambahBaris('users', { ...input });
  return id;
}

export async function perbaruiPengguna(
  id: string,
  patch: Partial<Omit<User, 'id'>>
): Promise<void> {
  await ubahBaris('users', id, { ...patch } as Record<string, string>);
}
