import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FirstAdminForm } from '@/components/AccountForms';
import { bridgeReady } from '@/lib/bridge';
import { listUsers } from '@/lib/data';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

/**
 * Only reachable while the `users` tab is empty. It exists so that a fresh
 * spreadsheet is not a dead end — it is never shown once a real account
 * exists, and it can never create a second first admin.
 */
export default async function SetupPage() {
  const ready = bridgeReady();

  if (!ready) {
    return (
      <div className="fullscreen">
        <div className="wide-box">
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Configuration is incomplete</h2>
                <p>The three secrets are not set in Vercel yet.</p>
              </div>
            </div>
            <div className="card-body">
              <ol className="steps">
                <li>
                  Run this on your computer to create{' '}
                  <span className="mono">AUTH_SECRET</span>:
                  <div className="code-block">
                    node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;base64url&apos;))&quot;
                  </div>
                </li>
                <li>
                  Open Vercel → this project → <strong>Settings</strong> →{' '}
                  <strong>Environment Variables</strong>.
                </li>
                <li>
                  Add <span className="mono">AUTH_SECRET</span>,{' '}
                  <span className="mono">BRIDGE_URL</span> and{' '}
                  <span className="mono">BRIDGE_TOKEN</span>.
                </li>
                <li>
                  Go to the <strong>Deployments</strong> tab and click{' '}
                  <strong>Redeploy</strong> so the new values are picked up.
                </li>
                <li>Reload this page.</li>
              </ol>
              <p className="text-small">
                Full walkthrough: <span className="mono">docs/PANDUAN.md</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let error: string | null = null;
  let count = 0;

  try {
    count = (await listUsers()).length;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (!error && count > 0) redirect('/login');

  return (
    <div className="centered">
      <div className="centered-card">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Account Manager</strong>
            <small>First run</small>
          </div>
        </div>

        <h1>Create the first admin</h1>
        <p className="sub">
          The spreadsheet has no sign-in account at all. This page creates one and then
          switches itself off for good.
        </p>

        {error ? (
          <div className="alert alert-error">
            <span>!</span>
            <div>
              <strong>Could not read the spreadsheet</strong>
              {error}
            </div>
          </div>
        ) : null}

        <FirstAdminForm />

        <div className="centered-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
