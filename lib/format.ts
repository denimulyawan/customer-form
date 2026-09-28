const NAMA_BULAN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/** Tanggal hari ini menurut waktu Indonesia (WIB), format YYYY-MM-DD. */
export function hariIni(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** 2026-02-14 -> "14 Feb 2026". Kalau bukan format itu, dikembalikan apa adanya. */
export function tampilkanTanggal(nilai: string): string {
  const t = String(nilai ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return t || '—';
  const [y, m, d] = t.split('-');
  const bulan = NAMA_BULAN[Number(m) - 1] ?? m;
  return `${Number(d)} ${bulan} ${y}`;
}

/** Waktu sekarang dalam bentuk teks ringkas, untuk kolom created_at / last_login. */
export function capWaktu(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replace(',', '');
}

/** Tampilkan capWaktu dengan rapi. */
export function tampilkanWaktu(nilai: string): string {
  const t = String(nilai ?? '').trim();
  if (!t) return 'Belum pernah';
  return t.replace(' ', ' · ');
}

export function namaFileTanggal(): string {
  return hariIni();
}
