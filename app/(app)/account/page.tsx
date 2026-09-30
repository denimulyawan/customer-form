import Link from 'next/link';
import DataError from '@/components/DataError';
import { PasswordForm, ProfileForm } from '@/components/AccountForms';
import { requireActiveUser } from '@/lib/auth';
import { safeLoad } from '@/lib/safe';
import { formatStamp } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/types';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

export default async function MyAccountPage() {
  const loaded = await safeLoad(() => requireActiveUser());
  if (!loaded.ok) return <DataError message={loaded.error} />;
  const { user } = loaded.data;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>My Account</h1>
          <p>
            {user.username} · {ROLE_LABEL[user.role]} · last sign-in{' '}
            {formatStamp(user.last_login)}
          </p>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>My details</h2>
              <p>
                These are shown as the Account Manager on every customer record you own.
              </p>
            </div>
          </div>
          <div className="card-body">
            <ProfileForm
              full_name={user.full_name}
              phone={user.phone}
              email={user.email}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Change password</h2>
              <p>
                Your password is stored only as a one-way hash — nobody can read it, not
                even the admin.
              </p>
            </div>
          </div>
          <div className="card-body">
            <PasswordForm />
          </div>
        </div>

        <p className="text-small" style={{ marginTop: 14 }}>
          Back to the <Link href="/">Dashboard</Link>.
        </p>
      </div>
    </>
  );
}
