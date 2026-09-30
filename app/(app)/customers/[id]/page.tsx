import Link from 'next/link';
import { notFound } from 'next/navigation';
import CustomerForm, { type ManagerOption } from '@/components/CustomerForm';
import DataError from '@/components/DataError';
import { updateCustomerAction } from '@/actions/customers';
import { loadBoth } from '@/lib/data';
import { safeLoad } from '@/lib/safe';
import { formatStamp } from '@/lib/format';
import { userLabel } from '@/lib/types';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const loaded = await safeLoad(() => loadBoth());
  if (!loaded.ok) return <DataError message={loaded.error} />;
  const { customers, users } = loaded.data;

  const customer = customers.find((c) => c.id === id);

  if (!customer) notFound();

  const managers: ManagerOption[] = users
    .filter((u) => u.status === 'aktif')
    .map((u) => ({ username: u.username, label: `${userLabel(u)} (${u.username})` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Keep the currently stored manager selectable even if that user was
  // deactivated, so editing does not silently reassign the account.
  if (
    customer.am_username &&
    !managers.some((m) => m.username === customer.am_username)
  ) {
    const u = users.find((x) => x.username === customer.am_username);
    managers.unshift({
      username: customer.am_username,
      label: u ? `${userLabel(u)} (${u.username}) — inactive` : customer.am_username,
    });
  }

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Edit Account</h1>
          <p>
            {customer.company_name || 'Unnamed'} · recorded{' '}
            {formatStamp(customer.created_at)}
          </p>
        </div>
        <div className="topbar-actions">
          <Link className="btn" href="/customers">
            ← Back
          </Link>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-body">
            <CustomerForm
              action={updateCustomerAction}
              submitLabel="Save changes"
              managers={managers}
              initial={{
                id: customer.id,
                company_name: customer.company_name,
                cid: customer.cid,
                account_username: customer.account_username,
                pic_name: customer.pic_name,
                pic_phone: customer.pic_phone,
                pic_email: customer.pic_email,
                am_username: customer.am_username,
              }}
            />
          </div>
        </div>

        <p className="text-small" style={{ marginTop: 14 }}>
          To remove this record, open the <Link href="/customers">Customer List</Link>{' '}
          and use the Delete button on its row.
        </p>
      </div>
    </>
  );
}
