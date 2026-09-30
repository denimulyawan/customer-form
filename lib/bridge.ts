import type { Customer, User } from './types';

export type TabName = 'customers' | 'users';

type Reply<T> = { ok: true; data: T } | { ok: false; error: string };

/** Are the three secrets configured? */
export function bridgeReady(): boolean {
  return Boolean(
    process.env.BRIDGE_URL && process.env.BRIDGE_TOKEN && process.env.AUTH_SECRET
  );
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
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
    });
  } catch {
    throw new Error(
      'Could not reach the spreadsheet bridge. Check BRIDGE_URL and your connection.'
    );
  }

  const text = await res.text();

  let reply: Reply<T>;
  try {
    reply = JSON.parse(text) as Reply<T>;
  } catch {
    throw new Error(
      'The bridge returned something unreadable. Make sure the Apps Script Web App is ' +
        'deployed with "Who has access: Anyone" and that the URL ends with /exec. ' +
        'Response started with: ' +
        text.slice(0, 160)
    );
  }

  if (!reply.ok) throw new Error(reply.error);
  return reply.data;
}

export type TabContents = {
  customers?: Customer[];
  users?: User[];
};

/** Reads one or more tabs in a single round trip. */
export async function readTabs(tabs: TabName[]): Promise<TabContents> {
  return call<TabContents>({ action: 'list', sheets: tabs });
}

export async function appendRow(
  tab: TabName,
  row: Record<string, string>
): Promise<{ id: string }> {
  return call<{ id: string }>({ action: 'append', sheet: tab, row });
}

export async function updateRow(
  tab: TabName,
  id: string,
  patch: Record<string, string>
): Promise<{ id: string }> {
  return call<{ id: string }>({ action: 'update', sheet: tab, id, patch });
}

export async function removeRow(tab: TabName, id: string): Promise<{ id: string }> {
  return call<{ id: string }>({ action: 'remove', sheet: tab, id });
}

/** Used by the connection check during installation. */
export async function pingBridge(): Promise<{
  pesan: string;
  waktu: string;
  tab: string[];
}> {
  return call({ action: 'ping' });
}
