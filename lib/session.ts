import { SignJWT, jwtVerify } from 'jose';
import type { Role } from './types';

/** Nama cookie penanda sesi login. */
export const SESSION_COOKIE = 'cf_sesi';

const MASA_BERLAKU_JAM = 8;

export const MASA_BERLAKU_DETIK = MASA_BERLAKU_JAM * 3600;

export type Sesi = {
  /** id user di tab `users`. */
  uid: string;
  username: string;
  role: Role;
  /** true = wajib ganti password sebelum bisa memakai aplikasi. */
  mcp: boolean;
};

function kunci(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'AUTH_SECRET belum di-set atau terlalu pendek (minimal 16 karakter).'
    );
  }
  return new TextEncoder().encode(s);
}

export async function buatTokenSesi(sesi: Sesi): Promise<string> {
  return new SignJWT({ ...sesi })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MASA_BERLAKU_JAM}h`)
    .sign(kunci());
}

export async function bacaTokenSesi(token: string): Promise<Sesi | null> {
  try {
    const { payload } = await jwtVerify(token, kunci());
    if (typeof payload.uid !== 'string' || !payload.uid) return null;
    return {
      uid: payload.uid,
      username: String(payload.username ?? ''),
      role: payload.role === 'admin' ? 'admin' : 'operator',
      mcp: payload.mcp === true,
    };
  } catch {
    return null;
  }
}

export function aturanCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MASA_BERLAKU_DETIK,
  };
}
