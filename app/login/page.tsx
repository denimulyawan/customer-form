import Link from 'next/link';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/FormLogin';
import { currentSession } from '@/lib/auth';
import { bridgeReady } from '@/lib/bridge';
import { listUsers } from '@/lib/data';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; e?: string }>;
}) {
  const sp = await searchParams;

  const session = await currentSession();
  if (session) redirect(session.mustChangePassword ? '/set-password' : '/');

  const ready = bridgeReady();

  // If the spreadsheet cannot be read we still show the sign-in form, along
  // with a clear explanation. Never a blank page.
  let bridgeError: string | null = null;
  let noAccounts = false;

  if (ready) {
    try {
      noAccounts = (await listUsers()).length === 0;
    } catch (e) {
      bridgeError = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <div className="centered">
      <div className="centered-card">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Account Manager</strong>
            <small>Customer Accounts</small>
          </div>
        </div>

        <h1>Sign in</h1>
        <p className="sub">Use the username and password given to you by the admin.</p>

        {sp.e === 'inactive' ? (
          <div className="alert alert-error">
            <span>!</span>
            <span>Your account is deactivated. Please contact your admin.</span>
          </div>
        ) : null}

        {sp.msg === 'created' ? (
          <div className="alert alert-success">
            <span>✓</span>
            <span>The admin account was created. Please sign in.</span>
          </div>
        ) : null}

        {!ready ? (
          <div className="alert alert-warning">
            <span>!</span>
            <div>
              <strong>Configuration is incomplete</strong>
              Set <span className="mono">BRIDGE_URL</span>,{' '}
              <span className="mono">BRIDGE_TOKEN</span> and{' '}
              <span className="mono">AUTH_SECRET</span> in Vercel, then redeploy. The full
              walkthrough is in <span className="mono">docs/PANDUAN.md</span>.
            </div>
          </div>
        ) : null}

        {bridgeError ? (
          <div className="alert alert-error">
            <span>!</span>
            <div>
              <strong>Could not read the spreadsheet</strong>
              {bridgeError}
            </div>
          </div>
        ) : null}

        {noAccounts ? (
          <div className="alert alert-info">
            <span>i</span>
            <div>
              <strong>No sign-in account exists yet</strong>
              The spreadsheet has no users. <Link href="/setup">Create the first admin</Link>{' '}
              to get started.
            </div>
          </div>
        ) : null}

        <LoginForm />

        <div className="centered-foot">Forgot your password? Ask the admin to reset it.</div>
      </div>
    </div>
  );
}
