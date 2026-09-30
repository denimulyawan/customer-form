import Link from 'next/link';
import Notice from '@/components/Notice';
import DataError from '@/components/DataError';
import { ColumnChart, DonutChart, type Slice } from '@/components/Charts';
import { loadBoth } from '@/lib/data';
import { safeLoad } from '@/lib/safe';
import { formatDate, initials, lastMonths, monthKey, nowStamp } from '@/lib/format';
import { userLabel } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; e?: string }>;
}) {
  const sp = await searchParams;

  const loaded = await safeLoad(() => loadBoth());
  if (!loaded.ok) return <DataError message={loaded.error} />;
  const { customers, users } = loaded.data;

  const totalAccounts = customers.length;

  const companyCount = new Set(
    customers.map((c) => (c.company_name ?? '').trim().toLowerCase()).filter(Boolean)
  ).size;

  const activeManagers = users.filter((u) => u.status === 'aktif');

  const thisMonth = monthKey(nowStamp());
  const addedThisMonth = customers.filter((c) => monthKey(c.created_at) === thisMonth).length;

  /* ---------- how many accounts each Account Manager owns ---------- */

  const perManager = new Map<string, number>();
  customers.forEach((c) => {
    const key = (c.am_username ?? '').trim();
    perManager.set(key, (perManager.get(key) ?? 0) + 1);
  });

  const byUsername = new Map(users.map((u) => [u.username, u]));
  const managerSlices: Slice[] = Array.from(perManager.entries())
    .map(([username, value]) => {
      if (!username) return { label: 'Unassigned', value };
      const u = byUsername.get(username);
      return { label: u ? userLabel(u) : username, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  /* ---------- how many were added each month ---------- */

  const months = lastMonths(6);
  const counts = new Map<string, number>(months.map((m) => [m.key, 0]));
  customers.forEach((c) => {
    const key = monthKey(c.created_at);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const monthSlices: Slice[] = months.map((m) => ({
    label: m.label.split(' ')[0],
    value: counts.get(m.key) ?? 0,
  }));

  /* ---------- newest records ---------- */

  const recent = [...customers]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 6);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of the customer accounts you manage.</p>
        </div>
        <div className="topbar-actions">
          <Link className="btn btn-primary" href="/customers/new">
            + Add Account
          </Link>
        </div>
      </header>

      <div className="content">
        <Notice msg={sp.msg} e={sp.e} />

        <div className="stat-grid">
          <div className="stat blue">
            <div className="label">Total Accounts</div>
            <div className="value">{totalAccounts}</div>
            <div className="foot">rows in the customers tab</div>
          </div>

          <div className="stat">
            <div className="label">Customers</div>
            <div className="value">{companyCount}</div>
            <div className="foot">distinct company names</div>
          </div>

          <div className="stat">
            <div className="label">Account Managers</div>
            <div className="value">{activeManagers.length}</div>
            <div className="foot">active app users</div>
          </div>

          <div className="stat green">
            <div className="label">Added This Month</div>
            <div className="value">{addedThisMonth}</div>
            <div className="foot">{formatDate(thisMonth + '-01')}</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Accounts per Account Manager</h2>
                <p>Who currently owns how many accounts.</p>
              </div>
            </div>
            <div className="card-body">
              <DonutChart
                data={managerSlices}
                centerLabel="accounts"
                emptyText="No accounts recorded yet."
              />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h2>Accounts Added per Month</h2>
                <p>The last six months of activity.</p>
              </div>
            </div>
            <div className="card-body">
              <ColumnChart
                data={monthSlices}
                emptyText="Nothing recorded in the last six months."
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Recently Added</h2>
              <p>The six most recent records.</p>
            </div>
            <Link className="btn btn-small" href="/customers">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">▤</div>
              <h3>No records yet</h3>
              <p>
                The spreadsheet is still empty. Start by adding your first customer
                account.
              </p>
              <Link className="btn btn-primary" href="/customers/new">
                + Add the first account
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>CID</th>
                    <th>Account Username</th>
                    <th>PIC</th>
                    <th>Account Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => {
                    const am = byUsername.get(c.am_username);
                    return (
                      <tr key={c.id}>
                        <td className="cell-strong">{c.company_name || '—'}</td>
                        <td className="mono">{c.cid || '—'}</td>
                        <td className="mono">{c.account_username || '—'}</td>
                        <td>
                          <div className="person-name">{c.pic_name || '—'}</div>
                          {c.pic_email ? (
                            <div className="person-meta">{c.pic_email}</div>
                          ) : null}
                        </td>
                        <td>
                          <div className="person">
                            <span className="avatar gray">
                              {initials(am ? userLabel(am) : c.am_username)}
                            </span>
                            <div>
                              <div className="person-name">
                                {am ? userLabel(am) : c.am_username || 'Unassigned'}
                              </div>
                              {am?.email ? (
                                <div className="person-meta">{am.email}</div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
