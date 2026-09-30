import Link from 'next/link';
import CustomerForm, { type ManagerOption } from '@/components/CustomerForm';
import DataError from '@/components/DataError';
import { createCustomerAction } from '@/actions/customers';
import { listUsers } from '@/lib/data';
import { safeLoad } from '@/lib/safe';
import { userLabel } from '@/lib/types';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

export default async function NewCustomerPage() {
  const loaded = await safeLoad(() => listUsers());
  if (!loaded.ok) return <DataError message={loaded.error} />;
  const users = loaded.data;

  const managers: ManagerOption[] = users
    .filter((u) => u.status === 'aktif')
    .map((u) => ({ username: u.username, label: `${userLabel(u)} (${u.username})` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Add Account</h1>
          <p>Record a new customer account. Fields marked required must be filled in.</p>
        </div>
        <div className="topbar-actions">
          <Link className="btn" href="/customers">
            ← Back
          </Link>
        </div>
      </header>

      <div className="content">
        {managers.length === 0 ? (
          <div className="alert alert-warning">
            <span>!</span>
            <div>
              <strong>No Account Manager available</strong>
              Every account needs an Account Manager, and those come from User
              Management. Create at least one user first.{' '}
              <Link href="/users">Go to User Management</Link>
            </div>
          </div>
        ) : null}

        <div className="card">
          <div className="card-body">
            <CustomerForm
              action={createCustomerAction}
              submitLabel="Save account"
              managers={managers}
              initial={{
                company_name: '',
                cid: '',
                account_username: '',
                pic_name: '',
                pic_phone: '',
                pic_email: '',
                am_username: '',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
