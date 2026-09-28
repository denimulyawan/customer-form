'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  daftarPengguna,
  simpanPenggunaBaru,
  perbaruiPengguna,
} from '@/lib/data';
import { hashPassword, PANJANG_MIN_PASSWORD } from '@/lib/password';
import { capWaktu } from '@/lib/format';
import { wajibAdmin } from '@/lib/auth';
import type { Role } from '@/lib/types';

export type HasilForm = { error?: string; sukses?: string } | null;

function pesanDari(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const POLA_USERNAME = /^[a-z0-9][a-z0-9._-]{2,19}$/;

const PESAN_POLA_USERNAME =
  'Username login harus 3–20 karakter, hanya huruf kecil, angka, titik, garis bawah, atau minus, dan diawali huruf/angka.';

export async function tambahPenggunaAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  await wajibAdmin();

  const username = String(fd.get('username') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const role: Role = fd.get('role') === 'admin' ? 'admin' : 'operator';

  if (!POLA_USERNAME.test(username)) return { error: PESAN_POLA_USERNAME };
  if (password.length < PANJANG_MIN_PASSWORD) {
    return { error: `Password awal minimal ${PANJANG_MIN_PASSWORD} karakter.` };
  }

  try {
    const sudahAda = (await daftarPengguna()).some(
      (u) => u.username_lower === username
    );
    if (sudahAda) {
      return { error: `Username "${username}" sudah dipakai. Pilih yang lain.` };
    }

    await simpanPenggunaBaru({
      username,
      username_lower: username,
      password_hash: hashPassword(password),
      role,
      status: 'aktif',
      must_change_password: 'ya',
      created_at: capWaktu(),
      last_login: '',
    });
  } catch (e) {
    return { error: pesanDari(e) };
  }

  revalidatePath('/pengguna');
  redirect('/pengguna?pesan=ditambah');
}

export async function resetPasswordAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  await wajibAdmin();

  const id = String(fd.get('id') ?? '').trim();
  const password = String(fd.get('password') ?? '');

  if (!id) return { error: 'Pengguna tidak ditemukan.' };
  if (password.length < PANJANG_MIN_PASSWORD) {
    return { error: `Password minimal ${PANJANG_MIN_PASSWORD} karakter.` };
  }

  try {
    await perbaruiPengguna(id, {
      password_hash: hashPassword(password),
      must_change_password: 'ya',
    });
  } catch (e) {
    return { error: pesanDari(e) };
  }

  revalidatePath('/pengguna');
  redirect('/pengguna?pesan=password');
}

export async function ubahStatusAction(fd: FormData): Promise<void> {
  const { pengguna: admin } = await wajibAdmin();

  const id = String(fd.get('id') ?? '').trim();
  const statusBaru = fd.get('status') === 'aktif' ? 'aktif' : 'nonaktif';

  if (!id) redirect('/pengguna?e=tidak-ada');
  if (id === admin.id) redirect('/pengguna?e=diri-sendiri');

  try {
    const semua = await daftarPengguna();
    const target = semua.find((u) => u.id === id);
    if (!target) redirect('/pengguna?e=tidak-ada');

    // Jangan sampai admin aktif terakhir dinonaktifkan.
    if (
      statusBaru === 'nonaktif' &&
      target.role === 'admin' &&
      semua.filter((u) => u.role === 'admin' && u.status === 'aktif').length <= 1
    ) {
      redirect('/pengguna?e=admin-terakhir');
    }

    await perbaruiPengguna(id, { status: statusBaru });
  } catch (e) {
    // redirect() melempar error khusus — biarkan lewat.
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    redirect('/pengguna?e=gagal');
  }

  revalidatePath('/pengguna');
  redirect('/pengguna?pesan=status');
}
