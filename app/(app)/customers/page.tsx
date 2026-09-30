import Link from 'next/link';
import Notice from '@/components/Notice';
import DeleteButton from '@/components/DeleteButton';
import DataError from '@/components/DataError';
import { deleteCustomerAction } from '@/actions/customers';
import { loadBoth } from '@/lib/data';
import { safeLoad } from '@/lib/safe';
import { initials } from '@/lib/format';
import { userLabel, type Customer, type User } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PER_PAGE = 20;

function matches(c: Customer, q: string, am: string): boolean {
  if (am && (c.am_username ?? '').trim() !== am) return false;
  if (q) {
    const haystack = [
      c.company_name,
      c.cid,
      c.account_username,
      c.pic_name,
      c.pic_phone,
      c.pic_email,
      c.am_username,
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q.toLowerCase())) return false;
  }
  return true;
}

function queryString(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

function ManagerCell({ username, byUsername }: { username: string; byUsername: Map<string, User> }) {
  const u = byUsername.get(username);
  const label = u ? userLabel(u) : username || 'Unassigned';
  return (
    <div className="person">
      <span className={`avatar${u ? '' : ' gray'}`}>{initials(label)}</span>
      <div>
        <div className="person-name">{label}</div>
        {u ? (
          <div className="person-meta">
            {[u.phone, u.email].filter(Boolean).join(' · ') || `@${u.username}`}
          </div>
        ) : (
          <div className="person-meta">not in User Management</div>
        )}
      </div>
    </div>
  );
}

export default async function CustomerList({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    am?: string;
    page?: string;
    msg?: string;
    e?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const am = (sp.am ?? '').trim();

  const loaded = await safeLoad(() => loadBoth());
  if (!loaded.ok) return <DataError message={loaded.error} />;
  const { customers, users } = loaded.data;
  const byUsername = new Map(users.map((u) => [u.username, u]));

  const results = customers
    .filter((c) => matches(c, q, am))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), totalPages);
  const start = (page - 1) * PER_PAGE;
  const visible = results.slice(start, start + PER_PAGE);

  const filtered = Boolean(q || am);
  const exportHref = `/api/export${queryString({ q, am })}`;

  const managerOptions = users
    .filter((u) => u.status === 'aktif')
    .sort((a, b) => userLabel(a).localeCompare(userLabel(b)));

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Customer List</h1>
          <p>
            {results.length} of {customers.length} records
            {filtered ? ' (filtered)' : ''}.
          </p>
        </div>
        <div className="topbar-actions">
          <a className="btn" href={exportHref}>
            ⤓ Export Excel
          </a>
          <Link className="btn btn-primary" href="/customers/new">
            + Add Account
          </Link>
        </div>
      </header>

      <div className="content">
        <Notice msg={sp.msg} e={sp.e} />

        <div className="card">
          <div className="card-body">
            <form className="searchbar" action="/customers" method="get">
              <div className="field wide">
                <label htmlFor="q">Search</label>
                <input
                  id="q"
                  name="q"
                  type="text"
                  defaultValue={q}
                  placeholder="company, CID, username, PIC name, phone or email"
                />
              </div>

              <div className="field">
                <label htmlFor="am">Account Manager</label>
                <select id="am" name="am" defaultValue={am}>
                  <option value="">All managers</option>
                  {managerOptions.map((u) => (
                    <option key={u.username} value={u.username}>
                      {userLabel(u)}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" type="submit">
                Apply
              </button>

              {filtered ? (
                <Link className="btn" href="/customers">
                  Clear
                </Link>
              ) : null}
            </form>
          </div>
        </div>

        <div className="card">
          {visible.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">▤</div>
              <h3>{filtered ? 'Nothing matches' : 'No records yet'}</h3>
              <p>
                {filtered
                  ? 'Try a different search term or clear the filters.'
                  : 'No customer accounts have been recorded yet.'}
              </p>
              {filtered ? (
                <Link className="btn" href="/customers">
                  Clear filters
                </Link>
              ) : (
                <Link className="btn btn-primary" href="/customers/new">
                  + Add the first account
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>CID</th>
                      <th>Account Username</th>
                      <th>PIC</th>
                      <th>Account Manager</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((c) => (
                      <tr key={c.id}>
                        <td className="cell-strong">{c.company_name || '—'}</td>
                        <td className="mono">{c.cid || '—'}</td>
                        <td className="mono">{c.account_username || '—'}</td>
                        <td>
                          <div className="person">
                            <span className="avatar gray">{initials(c.pic_name || '?')}</span>
                            <div>
                              <div className="person-name">{c.pic_name || '—'}</div>
                              <div className="person-meta">
                                {[c.pic_email, c.pic_phone].filter(Boolean).join(' · ') || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <ManagerCell username={c.am_username} byUsername={byUsername} />
                        </td>
                        <td className="actions">
                          <Link className="btn btn-small" href={`/customers/${c.id}`}>
                            Edit
                          </Link>
                          <DeleteButton
                            id={c.id}
                            title={c.company_name || '(no company name)'}
                            subtitle={`${c.account_username || 'no username'} · CID ${
                              c.cid || '—'
                            }`}
                            action={deleteCustomerAction}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <div className="pager">
                  <div className="text-small">
                    Showing {start + 1}–{Math.min(start + PER_PAGE, results.length)} of{' '}
                    {results.length}
                  </div>
                  <div className="topbar-actions">
                    {page > 1 ? (
                      <Link
                        className="btn btn-small"
                        href={`/customers${queryString({ q, am, page: page - 1 })}`}
                      >
                        ← Previous
                      </Link>
                    ) : null}
                    <span className="text-small">
                      Page {page} / {totalPages}
                    </span>
                    {page < totalPages ? (
                      <Link
                        className="btn btn-small"
                        href={`/customers${queryString({ q, am, page: page + 1 })}`}
                      >
                        Next →
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
