import type { Akun, User } from './types';

export type NamaTab = 'akun' | 'users';

type Jawaban<T> = { ok: true; data: T } | { ok: false; error: string };

/** Apakah ketiga nilai rahasia sudah terpasang? */
export function jembatanSiap(): boolean {
  return Boolean(
    process.env.BRIDGE_URL && process.env.BRIDGE_TOKEN && process.env.AUTH_SECRET
  );
}

async function panggil<T>(body: Record<string, unknown>): Promise<T> {
  const url = process.env.BRIDGE_URL;
  const token = process.env.BRIDGE_TOKEN;

  if (!url || !token) {
    throw new Error('BRIDGE_URL atau BRIDGE_TOKEN belum di-set di pengaturan Vercel.');
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...body }),
      cache: 'no-store',
      redirect: 'follow',
    });
  } catch {
    throw new Error(
      'Tidak bisa menghubungi jembatan spreadsheet. Periksa BRIDGE_URL dan koneksi internet.'
    );
  }

  const teks = await res.text();

  let jawab: Jawaban<T>;
  try {
    jawab = JSON.parse(teks) as Jawaban<T>;
  } catch {
    throw new Error(
      'Jawaban dari jembatan tidak bisa dibaca. Pastikan Web App Apps Script di-deploy ' +
        'dengan "Who has access: Anyone" dan URL-nya berakhiran /exec. ' +
        'Cuplikan jawaban: ' +
        teks.slice(0, 160)
    );
  }

  if (!jawab.ok) throw new Error(jawab.error);
  return jawab.data;
}

export type IsiTab = {
  akun?: Akun[];
  users?: User[];
};

/** Mengambil isi satu atau beberapa tab sekaligus (satu kali perjalanan). */
export async function ambilTab(tabs: NamaTab[]): Promise<IsiTab> {
  return panggil<IsiTab>({ action: 'list', sheets: tabs });
}

export async function tambahBaris(
  tab: NamaTab,
  row: Record<string, string>
): Promise<{ id: string }> {
  return panggil<{ id: string }>({ action: 'append', sheet: tab, row });
}

export async function ubahBaris(
  tab: NamaTab,
  id: string,
  patch: Record<string, string>
): Promise<{ id: string }> {
  return panggil<{ id: string }>({ action: 'update', sheet: tab, id, patch });
}

export async function hapusBaris(tab: NamaTab, id: string): Promise<{ id: string }> {
  return panggil<{ id: string }>({ action: 'remove', sheet: tab, id });
}

/** Untuk tombol "Tes koneksi" saat pemasangan. */
export async function pingJembatan(): Promise<{
  pesan: string;
  waktu: string;
  tab: string[];
}> {
  return panggil({ action: 'ping' });
}
