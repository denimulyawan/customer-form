import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, bacaTokenSesi, type Sesi } from './session';
import { daftarPengguna } from './data';
import type { User } from './types';

/** Sesi dari cookie. Tidak menyentuh jaringan — cepat. */
export async function sesiSekarang(): Promise<Sesi | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return bacaTokenSesi(token);
}

/** Sesi wajib ada, kalau tidak lempar ke halaman login. */
export async function wajibSesi(): Promise<Sesi> {
  const sesi = await sesiSekarang();
  if (!sesi) redirect('/login');
  return sesi;
}

/**
 * Sesi + data user terbaru dari spreadsheet.
 * Dipakai sebelum semua operasi tulis, supaya akun yang baru dinonaktifkan
 * langsung kehilangan hak akses walau cookie-nya masih berlaku.
 */
export async function wajibPenggunaAktif(): Promise<{ sesi: Sesi; pengguna: User }> {
  const sesi = await wajibSesi();
  const pengguna = (await daftarPengguna()).find((u) => u.id === sesi.uid);
  if (!pengguna || pengguna.status !== 'aktif') redirect('/login?e=nonaktif');
  return { sesi, pengguna };
}

/** Sama seperti di atas, tapi khusus admin. */
export async function wajibAdmin(): Promise<{ sesi: Sesi; pengguna: User }> {
  const hasil = await wajibPenggunaAktif();
  if (hasil.pengguna.role !== 'admin') redirect('/?e=bukanadmin');
  return hasil;
}
