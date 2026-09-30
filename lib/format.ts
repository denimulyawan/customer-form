export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Timestamp right now in Indonesia time, shaped as "YYYY-MM-DD HH:mm". */
export function nowStamp(): string {
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

/** Today in Indonesia time, shaped as "YYYY-MM-DD". */
export function today(): string {
  return nowStamp().slice(0, 10);
}

/** "2026-02-14 09:30" -> "14 Feb 2026". Anything else is returned as-is. */
export function formatDate(value: string): string {
  const t = String(value ?? '').trim();
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return t || '—';
  const bulan = MONTHS_SHORT[Number(m[2]) - 1] ?? m[2];
  return `${Number(m[3])} ${bulan} ${m[1]}`;
}

/** "2026-02-14 09:30" -> "14 Feb 2026, 09:30". */
export function formatStamp(value: string): string {
  const t = String(value ?? '').trim();
  if (!t) return 'Never';
  const jam = t.slice(11, 16);
  const tanggal = formatDate(t);
  return jam ? `${tanggal}, ${jam}` : tanggal;
}

/** "2026-02-14 09:30" -> "2026-02" */
export function monthKey(value: string): string {
  return String(value ?? '').trim().slice(0, 7);
}

/** "2026-02" -> "Feb 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const bulan = MONTHS_SHORT[Number(m) - 1] ?? m;
  return `${bulan} ${y}`;
}

/**
 * The last `count` months, oldest first, ending with the current month.
 * Used by the dashboard growth chart.
 */
export function lastMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const [y0, m0] = today().split('-').map(Number);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y0, m0 - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    out.push({ key, label: monthLabel(key) });
  }
  return out;
}

/** Initials used by the avatar bubbles. */
export function initials(text: string): string {
  const bersih = String(text ?? '').trim();
  if (!bersih) return '?';
  const kata = bersih.split(/\s+/).slice(0, 2);
  return kata.map((k) => k[0]?.toUpperCase() ?? '').join('') || '?';
}
