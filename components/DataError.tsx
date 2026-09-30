'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Shown when the app cannot read the spreadsheet. Far more useful than the
 * generic "Application error" page, and it names the usual causes.
 */
export default function DataError({
  message,
  title = 'Could not read the spreadsheet',
}: {
  message: string;
  title?: string;
}) {
  const router = useRouter();

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Cannot load this page</h1>
          <p>The app could not reach the spreadsheet behind it.</p>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-error">
              <span>!</span>
              <div>
                <strong>{title}</strong>
                {message}
              </div>
            </div>

            <h3 className="section-title">What usually fixes this</h3>
            <ol className="steps">
              <li>
                <strong>It may just be slow.</strong> Google Apps Script goes to sleep when
                it has not been used for a while, and the first request can take 10–30
                seconds. Wait a moment and press <em>Try again</em> — the second attempt is
                normally quick.
              </li>
              <li>
                <strong>The Apps Script code is out of date.</strong> Open the spreadsheet →
                Extensions → Apps Script, paste the current <span className="mono">Code.gs</span>,
                run <span className="mono">setup</span>, then deploy a new version.
              </li>
              <li>
                <strong>The URL points at an old deployment.</strong> Copy the Web app URL
                again from <span className="mono">Deploy → Manage deployments</span> and make
                sure <span className="mono">BRIDGE_URL</span> in Vercel matches it, then
                redeploy.
              </li>
              <li>
                <strong>The token does not match.</strong> The value of{' '}
                <span className="mono">BRIDGE_TOKEN</span> in Vercel has to be identical to{' '}
                <span className="mono">TOKEN</span> inside <span className="mono">Code.gs</span>.
              </li>
            </ol>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => router.refresh()}
              >
                Try again
              </button>
              <Link className="btn" href="/login">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
