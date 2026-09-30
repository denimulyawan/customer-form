/**
 * Runs a data load and turns a failure into a value instead of an exception,
 * so a broken bridge shows a helpful panel rather than a crash page.
 */
export type Loaded<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Next.js signals navigation by throwing, so those must always be re-thrown.
 * Swallowing them here would break redirect() and notFound().
 */
function isNextNavigation(e: unknown): boolean {
  const digest = (e as { digest?: unknown })?.digest;
  return typeof digest === 'string' && digest.startsWith('NEXT_');
}

export async function safeLoad<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (isNextNavigation(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
