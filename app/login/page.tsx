import { redirect } from 'next/navigation';
import FormLogin from '@/components/FormLogin';
import { sesiSekarang } from '@/lib/auth';
import { jembatanSiap } from '@/lib/bridge';
import { daftarPengguna } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HalamanLogin({
  searchParams,
}: {
  searchParams: Promise<{ pesan?: string; e?: string }>;
}) {
  const sp = await searchParams;

  const sesi = await sesiSekarang();
  if (sesi) redirect(sesi.mcp ? '/ganti-password?paksa=1' : '/');

  const siap = jembatanSiap();

  // Kalau belum ada satu pun akun login, arahkan ke halaman pembuatan admin.
  // Catatan: redirect() harus dipanggil DI LUAR try/catch — dia bekerja dengan
  // melempar error khusus, dan catch akan menelannya.
  let galatJembatan: string | null = null;
  let belumAdaAkun = false;

  if (siap) {
    try {
      belumAdaAkun = (await daftarPengguna()).length === 0;
    } catch (e) {
      galatJembatan = e instanceof Error ? e.message : String(e);
    }
  }

  if (belumAdaAkun) redirect('/setup');

  return (
    <div className="pusat">
      <div className="pusat-kartu">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Manajemen Akun Pelanggan</strong>
            <small>SolarWinds · Duo</small>
          </div>
        </div>

        <h1>Masuk</h1>
        <p className="sub">
          Gunakan username dan password yang diberikan admin.
        </p>

        {sp.e === 'nonaktif' ? (
          <div className="alert alert-error">
            <span>!</span>
            <span>Akun kamu sedang dinonaktifkan. Hubungi admin.</span>
          </div>
        ) : null}

        {sp.pesan === 'admin-dibuat' ? (
          <div className="alert alert-sukses">
            <span>✓</span>
            <span>Admin pertama berhasil dibuat. Silakan masuk.</span>
          </div>
        ) : null}

        {!siap ? (
          <div className="alert alert-peringatan">
            <span>!</span>
            <div>
              <strong>Konfigurasi belum lengkap</strong>
              Isi <span className="mono">BRIDGE_URL</span>,{' '}
              <span className="mono">BRIDGE_TOKEN</span>, dan{' '}
              <span className="mono">AUTH_SECRET</span> di pengaturan Vercel, lalu deploy
              ulang. Langkah lengkapnya ada di <span className="mono">docs/PANDUAN.md</span>.
            </div>
          </div>
        ) : null}

        {galatJembatan ? (
          <div className="alert alert-error">
            <span>!</span>
            <div>
              <strong>Tidak bisa membaca spreadsheet</strong>
              {galatJembatan}
            </div>
          </div>
        ) : null}

        <FormLogin />

        <div className="pusat-kaki">
          Lupa password? Hubungi admin untuk disetel ulang.
        </div>
      </div>
    </div>
  );
}
