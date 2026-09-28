import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const N = 16384;
const R = 8;
const P = 1;
const PANJANG = 64;

/**
 * Mengubah password jadi "sidik jari" satu arah.
 * Password aslinya tidak pernah disimpan di mana pun.
 */
export function hashPassword(password: string): string {
  const garam = randomBytes(16);
  const kunci = scryptSync(password, garam, PANJANG, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${garam.toString('hex')}$${kunci.toString('hex')}`;
}

/** Mencocokkan password yang diketik dengan sidik jari yang tersimpan. */
export function verifyPassword(password: string, tersimpan: string): boolean {
  try {
    const bagian = String(tersimpan).split('$');
    if (bagian.length !== 6 || bagian[0] !== 'scrypt') return false;

    const n = Number(bagian[1]);
    const r = Number(bagian[2]);
    const p = Number(bagian[3]);
    const garam = Buffer.from(bagian[4], 'hex');
    const kunciTersimpan = Buffer.from(bagian[5], 'hex');
    if (!n || !r || !p || garam.length === 0 || kunciTersimpan.length === 0) return false;

    const kunci = scryptSync(password, garam, kunciTersimpan.length, { N: n, r, p });
    return timingSafeEqual(kunci, kunciTersimpan);
  } catch {
    return false;
  }
}

/** Aturan panjang minimal password. */
export const PANJANG_MIN_PASSWORD = 8;
