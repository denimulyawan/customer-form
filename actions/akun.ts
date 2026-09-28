'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { simpanAkunBaru, perbaruiAkun, buangAkun } from '@/lib/data';
import { wajibPenggunaAktif } from '@/lib/auth';
import { hariIni } from '@/lib/format';
import type { AkunInput } from '@/lib/types';

export type HasilForm = { error?: string; sukses?: string } | null;

function pesanDari(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function bacaForm(fd: FormData): AkunInput {
  return {
    nama_pelanggan: String(fd.get('nama_pelanggan') ?? '').trim(),
    username: String(fd.get('username') ?? '').trim(),
    email_solarwinds: String(fd.get('email_solarwinds') ?? '').trim(),
    email_duo: String(fd.get('email_duo') ?? '').trim(),
    pic: String(fd.get('pic') ?? '').trim(),
    tanggal_input: String(fd.get('tanggal_input') ?? '').trim() || hariIni(),
  };
}

function periksa(input: AkunInput): string | null {
  if (!input.nama_pelanggan) return 'Nama pelanggan wajib diisi.';
  if (!input.username) return 'Username wajib diisi.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal_input)) {
    return 'Tanggal harus dalam format YYYY-MM-DD (contoh: 2026-02-14).';
  }
  if (input.email_solarwinds && !input.email_solarwinds.includes('@')) {
    return 'Email SolarWinds sepertinya bukan alamat email yang benar.';
  }
  if (input.email_duo && !input.email_duo.includes('@')) {
    return 'Email Duo sepertinya bukan alamat email yang benar.';
  }
  return null;
}

export async function tambahAkunAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  await wajibPenggunaAktif();

  const input = bacaForm(fd);
  const salah = periksa(input);
  if (salah) return { error: salah };

  try {
    await simpanAkunBaru(input);
  } catch (e) {
    return { error: pesanDari(e) };
  }

  revalidatePath('/');
  revalidatePath('/akun');
  redirect('/akun?pesan=ditambah');
}

export async function ubahAkunAction(
  _sebelumnya: HasilForm,
  fd: FormData
): Promise<HasilForm> {
  await wajibPenggunaAktif();

  const id = String(fd.get('id') ?? '').trim();
  if (!id) return { error: 'Id data tidak ditemukan.' };

  const input = bacaForm(fd);
  const salah = periksa(input);
  if (salah) return { error: salah };

  try {
    await perbaruiAkun(id, input);
  } catch (e) {
    return { error: pesanDari(e) };
  }

  revalidatePath('/');
  revalidatePath('/akun');
  redirect('/akun?pesan=disimpan');
}

/** Dipanggil dari tombol Hapus (setelah dialog konfirmasi). */
export async function hapusAkunAction(id: string): Promise<void> {
  await wajibPenggunaAktif();
  await buangAkun(id);
  revalidatePath('/');
  revalidatePath('/akun');
}
