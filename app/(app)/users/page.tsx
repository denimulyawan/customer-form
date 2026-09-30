import Link from 'next/link';
import { redirect } from 'next/navigation';
import Notice from '@/components/Notice';
import DataError from '@/components/DataError';
import { CreateUserForm, ResetPasswordForm } from '@/components/UserForms';
import { toggleStatusAction } from '@/actions/users';
import { requireSession } from '@/lib/auth';
import { listUsers } from '@/lib/data';
import { safeLoad } from '@/lib/safe';
import { formatStamp } from '@/lib/format';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; e?: string }>;
}) {
  const sp = await searchParams;

  // ONE read of the spreadsheet, not two. The admin's own record is already
  // inside this list, so fetching it separately — as requireAdmin() does —
  // doubled the wait on this page for no benefit.
  const loaded = await safeLoad(async () => {
    const session = await requireSession();
    const users = await listUsers();
    const me = users.find((u) => u.id === session.userId);
    if (!me || me.status !== 'aktif') redirect('/login?e=inactive');
    if (me.role !== 'admin') redirect('/?e=notadmin');
    return { me, users };
  });
  if (!loaded.ok) return <DataError message={loaded.error} />;
  const { me, users } = loaded.data;

  const sorted = [...users].sort((a, b) =>
    String(a.username).localeCompare(String(b.username))
  );

  const activeAdmins = sorted.filter(
    (u) => u.role === 'admin' && u.status === 'aktif'
  ).length;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>User Management</h1>
          <p>
            {sorted.length} sign-in account(s) · {activeAdmins} active admin(s)
          </p>
        </div>
      </header>

      <div className="content">
        <Notice msg={sp.msg} e={sp.e} />

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Create a user</h2>
              <p>
                Account Managers are picked from this list, so keep the names and
                contact details up to date.
              </p>
            </div>
          </div>
          <div className="card-body">
            <CreateUserForm />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Sign-in accounts</h2>
              <p>Including when each account last signed in.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last sign-in</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u) => {
                  const isMe = u.id === me.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="person-name mono">
                          {u.username}
                          {isMe ? (
                            <span className="badge badge-gray" style={{ marginLeft: 8 }}>
                              you
                            </span>
                          ) : null}
                        </div>
                        <div className="person-meta">
                          {[u.full_name, u.email, u.phone].filter(Boolean).join(' · ') ||
                            'no details yet'}
                        </div>
                      </td>
                      <td>
                        <span
                          className={u.role === 'admin' ? 'badge badge-blue' : 'badge badge-gray'}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Operator'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={u.status === 'aktif' ? 'badge badge-green' : 'badge badge-amber'}
                        >
                          {u.status === 'aktif' ? 'Active' : 'Inactive'}
                        </span>
                        {u.must_change_password === 'ya' ? (
                          <>
                            {' '}
                            <span className="badge badge-amber">must change password</span>
                          </>
                        ) : null}
                      </td>
                      <td className="cell-muted text-small">
                        {formatStamp(u.last_login)}
                      </td>
                      <td className="actions">
                        <details className="details-block" style={{ display: 'inline-block' }}>
                          <summary>Reset password</summary>
                          <div className="body" style={{ minWidth: 280 }}>
                            <ResetPasswordForm id={u.id} />
                          </div>
                        </details>

                        <form action={toggleStatusAction} style={{ display: 'inline-block' }}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={u.status === 'aktif' ? 'nonaktif' : 'aktif'}
                          />
                          <button
                            className="btn btn-small"
                            type="submit"
                            disabled={isMe}
                            title={
                              isMe ? 'You cannot deactivate your own account' : undefined
                            }
                          >
                            {u.status === 'aktif' ? 'Deactivate' : 'Activate'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-small" style={{ marginTop: 14 }}>
          Update your own name, phone and email in <Link href="/account">My Account</Link>{' '}
          — that is what customer records show as the Account Manager.
        </p>
      </div>
    </>
  );
}
