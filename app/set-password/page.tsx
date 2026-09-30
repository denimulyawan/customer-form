import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PasswordForm } from '@/components/AccountForms';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

/**
 * Standalone page, deliberately OUTSIDE the (app) group.
 *
 * The (app) layout sends anyone with the "must change password" flag here, so
 * this page must not live under that layout. It also reads the SAME flag from
 * the same place — the signed session — because if the two ever disagreed the
 * redirects would bounce back and forth forever.
 */
export default async function SetPasswordPage() {
  const session = await requireSession();

  if (!session.mustChangePassword) redirect('/');

  return (
    <div className="centered">
      <div className="centered-card wide">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Account Manager</strong>
            <small>{session.username}</small>
          </div>
        </div>

        <h1>Choose your own password</h1>
        <p className="sub">
          This is your first sign-in with the password your admin handed over. Replace it
          with something only you know before continuing.
        </p>

        <div className="alert alert-warning">
          <span>!</span>
          <div>
            <strong>Change your password first</strong>
            Your password is stored only as a one-way hash — nobody can read it, not even
            the admin.
          </div>
        </div>

        <PasswordForm forced />

        <div className="centered-foot">
          Done already? <Link href="/">Continue to the dashboard</Link>
        </div>
      </div>
    </div>
  );
}
