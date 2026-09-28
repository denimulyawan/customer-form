'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { daftarPengguna, perbaruiPengguna, simpanPenggunaBaru } from '@/lib/data';
import { hashPassword, verifyPassword, PANJANG_MIN_PASSWORD } from '@/lib/password';
import { SESSION_COOKIE, aturanCookie, buatTokenSesi } from '@/lib/session';
import { capWaktu } from '@/lib/format';
import { jembatanSiap } from '@/lib/bridge';
import { wajibSesi } from '@/lib/auth';

export type HasilForm = { error?: string; sukses?: string } | null;

const PESAN_KONFIGURASI =
  'Konfigurasi belum lengkap. Pastikan BRIDGE_URL, BRIDGE_TOKEN, dan AUTH_SECRET ' +
  'sudah diisi di pengaturan Vercel, lalu deploy ulang.';

/** Batas jumlah akun yang gagal login berturut-turut sebelum ditolak sementara. */
const BATAS_GAGAL = 8;
const JEDA_KUNCI_MENIT = 5;

/**
 * Penghitung sederhana di memori untuk meredam percobaan password berulang.
 * Bersifat per-instance Vercel; cukup untuk menghentikan coba-coba asal.
 */
const catatanGagal = new Map<string, { jumlah: number; sampai: number }>();

function sedangTerkunci(kunci: string): number {
  const c = catatanGagal.get(kunci);
  if (!c) return 0;
  if (c.jumlah >= BATAS_GAGAL && Date.now() < c.sampai) {
    return Math.ceil((c.sampai - Date.now()) / 60000);
  }
  if (Date.now() >= c.sampai) catatanGagal.delete(kunci);
  return 0;
}

function catatGagal(kunci: string) {
  const c = catatanGagal.get(kunci) ?? { jumlah: 0, sampai: 0 };
  c.jumlah += 1;
  c.sampai = Date.now() + JEDA_KUNCI_MENIT * 60000;
  catatanGagal.set(kunci, c);
}

function hapusCatatan(kunci: string) {
  catatanGagal.delete(kunci);
}

export async function masukAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  if (!jembatanSiap()) return { error: PESAN_KONFIGURASI };

  const username = String(fd.get('username') ?? '').trim();
  const password = String(fd.get('password') ?? '');

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  const kunci = username.toLowerCase();
  const terkunci = sedangTerkunci(kunci);
  if (terkunci > 0) {
    return {
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${terkunci} menit.`,
    };
  }

  let pengguna;
  try {
    pengguna = (await daftarPengguna()).find((u) => u.username_lower === kunci);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  // Pesan sengaja disamakan: jangan sampai membocorkan username mana yang ada.
  if (!pengguna || !verifyPassword(password, pengguna.password_hash)) {
    catatGagal(kunci);
    return { error: 'Username atau password salah.' };
  }

  if (pengguna.status !== 'aktif') {
    return { error: 'Akun ini sedang dinonaktifkan. Hubungi admin.' };
  }

  hapusCatatan(kunci);

  const perluGanti = pengguna.must_change_password === 'ya';

  const c = await cookies();
  c.set(
    SESSION_COOKIE,
    await buatTokenSesi({
      uid: pengguna.id,
      username: pengguna.username,
      role: pengguna.role,
      mcp: perluGanti,
    }),
    aturanCookie()
  );

  // Pencatatan waktu login tidak boleh menggagalkan proses masuk.
  try {
    await perbaruiPengguna(pengguna.id, { last_login: capWaktu() });
  } catch {
    /* diabaikan */
  }

  redirect(perluGanti ? '/ganti-password?paksa=1' : '/');
}

export async function keluarAction(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  redirect('/login');
}

export async function gantiPasswordAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  const sesi = await wajibSesi();

  const lama = String(fd.get('lama') ?? '');
  const baru = String(fd.get('baru') ?? '');
  const ulang = String(fd.get('ulang') ?? '');

  let pengguna;
  try {
    pengguna = (await daftarPengguna()).find((u) => u.id === sesi.uid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  if (!pengguna) return { error: 'Akun tidak ditemukan.' };
  if (!verifyPassword(lama, pengguna.password_hash)) {
    return { error: 'Password lama tidak cocok.' };
  }
  if (baru.length < PANJANG_MIN_PASSWORD) {
    return { error: `Password baru minimal ${PANJANG_MIN_PASSWORD} karakter.` };
  }
  if (baru !== ulang) return { error: 'Ulangi password baru belum sama.' };
  if (baru === lama) return { error: 'Password baru harus berbeda dari password lama.' };

  try {
    await perbaruiPengguna(pengguna.id, {
      password_hash: hashPassword(baru),
      must_change_password: 'tidak',
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  const c = await cookies();
  c.set(
    SESSION_COOKIE,
    await buatTokenSesi({
      uid: pengguna.id,
      username: pengguna.username,
      role: pengguna.role,
      mcp: false,
    }),
    aturanCookie()
  );

  redirect('/?pesan=password-diganti');
}

export async function buatAdminPertamaAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  if (!jembatanSiap()) return { error: PESAN_KONFIGURASI };

  const username = String(fd.get('username') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const ulang = String(fd.get('ulang') ?? '');

  if (!/^[a-z0-9][a-z0-9._-]{2,19}$/.test(username)) {
    return {
      error:
        'Username harus 3–20 karakter, huruf kecil/angka/titik/garis bawah, dan diawali huruf atau angka.',
    };
  }
  if (password.length < PANJANG_MIN_PASSWORD) {
    return { error: `Password minimal ${PANJANG_MIN_PASSWORD} karakter.` };
  }
  if (password !== ulang) return { error: 'Ulangi password belum sama.' };

  let jumlah;
  try {
    jumlah = (await daftarPengguna()).length;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  if (jumlah > 0) {
    return {
      error: 'Admin pertama sudah pernah dibuat. Halaman ini tidak bisa dipakai lagi.',
    };
  }

  try {
    await simpanPenggunaBaru({
      username,
      username_lower: username,
      password_hash: hashPassword(password),
      role: 'admin',
      status: 'aktif',
      must_change_password: 'tidak',
      created_at: capWaktu(),
      last_login: '',
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  redirect('/login?pesan=admin-dibuat');
}
