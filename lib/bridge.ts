import type { Customer, User } from './types';

export type TabName = 'customers' | 'users';

type Reply<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Thrown when the bridge could not be reached or answered with something that
 * is not our JSON. These are safe to retry for reads.
 */
export class BridgeUnreachableError extends Error {}

/** Are the three secrets configured? */
export function bridgeReady(): boolean {
  return Boolean(
    process.env.BRIDGE_URL && process.env.BRIDGE_TOKEN && process.env.AUTH_SECRET
  );
}

const READ_TIMEOUT_MS = 20000;
const READ_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function call<T>(body: Record<string, unknown>, timeoutMs?: number): Promise<T> {
  const url = process.env.BRIDGE_URL;
  const token = process.env.BRIDGE_TOKEN;

  if (!url || !token) {
    throw new Error('BRIDGE_URL or BRIDGE_TOKEN is not set in Vercel.');
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...body }),
      cache: 'no-store',
      redirect: 'follow',
      // Only reads get a timeout. Aborting a write could leave the app unsure
      // whether the row was actually saved.
      ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
    });
  } catch {
    throw new BridgeUnreachableError(
      'Could not reach the spreadsheet bridge in time. Apps Script can be slow when it ' +
        'has not been used for a while — try again in a moment.'
    );
  }

  const text = await res.text();

  let reply: Reply<T>;
  try {
    reply = JSON.parse(text) as Reply<T>;
  } catch {
    throw new BridgeUnreachableError(
      'The bridge returned something unreadable. Make sure the Apps Script Web App is ' +
        'deployed with "Who has access: Anyone" and that the URL ends with /exec. ' +
        'Response started with: ' +
        text.slice(0, 160)
    );
  }

  if (!reply.ok) throw new Error(reply.error);
  return reply.data;
}

/**
 * Reads may be retried: they change nothing, so a second attempt is harmless.
 * A slow first request is often just Apps Script waking up.
 */
async function read<T>(body: Record<string, unknown>): Promise<T> {
  let last: unknown;

  for (let attempt = 1; attempt <= READ_ATTEMPTS; attempt++) {
    try {
      return await call<T>(body, READ_TIMEOUT_MS);
    } catch (e) {
      last = e;
      if (!(e instanceof BridgeUnreachableError)) throw e;
      if (attempt < READ_ATTEMPTS) await sleep(800 * attempt);
    }
  }

  throw last;
}

export type TabContents = {
  customers?: Customer[];
  users?: User[];
};

/** Reads one or more tabs in a single round trip. */
export async function readTabs(tabs: TabName[]): Promise<TabContents> {
  return read<TabContents>({ action: 'list', sheets: tabs });
}

/**
 * A permission check that travels with a write.
 *
 * The script verifies it inside the same call, before changing anything, so a
 * save no longer needs a separate read just to confirm the signed-in account is
 * still active — one trip to Google instead of two.
 */
export type WriteGuard = {
  sheet: TabName;
  id: string;
  expect: Record<string, string>;
};

export async function appendRow(
  tab: TabName,
  row: Record<string, string>,
  guard?: WriteGuard
): Promise<{ id: string }> {
  return call<{ id: string }>({ action: 'append', sheet: tab, row, guard });
}

export async function updateRow(
  tab: TabName,
  id: string,
  patch: Record<string, string>,
  guard?: WriteGuard
): Promise<{ id: string }> {
  return call<{ id: string }>({ action: 'update', sheet: tab, id, patch, guard });
}

export async function removeRow(
  tab: TabName,
  id: string,
  guard?: WriteGuard
): Promise<{ id: string }> {
  return call<{ id: string }>({ action: 'remove', sheet: tab, id, guard });
}

/** Used by the connection check during installation. */
export async function pingBridge(): Promise<{
  pesan: string;
  waktu: string;
  tab: string[];
}> {
  return read({ action: 'ping' });
}
