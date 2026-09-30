import { redirect } from 'next/navigation';
import NavLinks from '@/components/NavLinks';
import { signOutAction } from '@/actions/auth';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  // Must change the password before using anything else. /set-password lives
  // outside this layout group on purpose, so this cannot loop.
  if (session.mustChangePassword) redirect('/set-password');

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Account Manager</strong>
            <small>Customer Accounts</small>
          </div>
        </div>

        <NavLinks role={session.role} />

        <div className="sidebar-foot">
          <div className="who">
            <strong>{session.username}</strong>
            <small>{session.role === 'admin' ? 'Admin' : 'Operator'}</small>
          </div>
          <form action={signOutAction}>
            <button className="btn btn-light btn-small btn-block" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="main">{children}</div>
    </div>
  );
}
