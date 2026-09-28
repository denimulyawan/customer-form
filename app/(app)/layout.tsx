import { redirect } from 'next/navigation';
import NavLinks from '@/components/NavLinks';
import { keluarAction } from '@/actions/auth';
import { wajibSesi } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LayoutDalam({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesi = await wajibSesi();

  // Wajib ganti password dulu sebelum boleh memakai aplikasi.
  if (sesi.mcp) redirect('/ganti-password?paksa=1');

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Manajemen Akun</strong>
            <small>SolarWinds · Duo</small>
          </div>
        </div>

        <NavLinks role={sesi.role} />

        <div className="sidebar-kaki">
          <div className="siapa">
            <strong>{sesi.username}</strong>
            <small>{sesi.role === 'admin' ? 'Admin' : 'Operator'}</small>
          </div>
          <form action={keluarAction}>
            <button className="btn btn-terang btn-kecil btn-lebar" type="submit">
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="main">{children}</div>
    </div>
  );
}
