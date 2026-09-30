import { SignJWT, jwtVerify } from 'jose';
import type { Role } from './types';

/** Name of the cookie that carries the signed-in session. */
export const SESSION_COOKIE = 'cf_session';

const TTL_HOURS = 8;

export const SESSION_TTL_SECONDS = TTL_HOURS * 3600;

export type Session = {
  /** id of the row in the `users` tab. */
  userId: string;
  username: string;
  role: Role;
  /** true = must change the password before using anything else. */
  mustChangePassword: boolean;
};

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET is missing or too short (16 characters minimum).');
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_HOURS}h`)
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.userId !== 'string' || !payload.userId) return null;
    return {
      userId: payload.userId,
      username: String(payload.username ?? ''),
      role: payload.role === 'admin' ? 'admin' : 'operator',
      mustChangePassword: payload.mustChangePassword === true,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
