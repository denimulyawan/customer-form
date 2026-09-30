import { redirect } from 'next/navigation';
import NavLinks from '@/components/NavLinks';
import Shell from '@/components/Shell';
import { signOutAction } from '@/actions/auth';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
// Apps Script can be slow on a cold start. Raise the function budget above
// Vercel's 10-second default so a slow first request is not cut off.
export const maxDuration = 60;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  // Must change the password before using anything else. /set-password lives
  // outside this layout group on purpose, so this cannot loop.
  if (session.mustChangePassword) redirect('/set-password');

  const sidebar = (
    <>
      <div className="brand">
        <span className="brand-mark">MA</span>
        <div className="brand-text">
          <strong>Account Manager</strong>
          <small>Customer Accounts</small>
        </div>
      </div>

      <NavLinks />

      <div className="sidebar-foot">
        <div className="who">
          <strong>{session.username}</strong>
          <small>Administrator</small>
        </div>
        <form action={signOutAction}>
          <button className="btn btn-light btn-small btn-block" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return <Shell sidebar={sidebar}>{children}</Shell>;
}
