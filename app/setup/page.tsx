import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FormSetup } from '@/components/FormAkunAuth';
import { jembatanSiap } from '@/lib/bridge';
import { daftarPengguna } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HalamanSetup() {
  const siap = jembatanSiap();

  if (!siap) {
    return (
      <div className="layar-penuh">
        <div className="kotak-lebar">
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Konfigurasi belum lengkap</h2>
                <p>Tiga nilai rahasia belum terpasang di Vercel.</p>
              </div>
            </div>
            <div className="card-body">
              <ol className="langkah">
                <li>
                  Jalankan perintah ini di komputer untuk membuat{' '}
                  <span className="mono">AUTH_SECRET</span>:
                  <div className="kode">
                    node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;base64url&apos;))&quot;
                  </div>
                </li>
                <li>
                  Buka Vercel → project ini → <strong>Settings</strong> →{' '}
                  <strong>Environment Variables</strong>.
                </li>
                <li>
                  Isi tiga variabel: <span className="mono">AUTH_SECRET</span>,{' '}
                  <span className="mono">BRIDGE_URL</span>, dan{' '}
                  <span className="mono">BRIDGE_TOKEN</span>.
                </li>
                <li>
                  Buka tab <strong>Deployments</strong>, klik <strong>Redeploy</strong>{' '}
                  supaya nilai barunya terbaca.
                </li>
                <li>Muat ulang halaman ini.</li>
              </ol>
              <p className="teks-kecil">
                Panduan lengkap dari awal: <span className="mono">docs/PANDUAN.md</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let galat: string | null = null;
  let jumlah = 0;

  try {
    jumlah = (await daftarPengguna()).length;
  } catch (e) {
    galat = e instanceof Error ? e.message : String(e);
  }

  if (!galat && jumlah > 0) redirect('/login');

  return (
    <div className="pusat">
      <div className="pusat-kartu">
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Manajemen Akun Pelanggan</strong>
            <small>Langkah pertama</small>
          </div>
        </div>

        <h1>Buat admin pertama</h1>
        <p className="sub">
          Belum ada satu pun akun login di spreadsheet. Buat akun admin pertamamu di
          sini. Halaman ini otomatis mati setelah admin pertama dibuat.
        </p>

        {galat ? (
          <div className="alert alert-error">
            <span>!</span>
            <div>
              <strong>Tidak bisa membaca spreadsheet</strong>
              {galat}
            </div>
          </div>
        ) : null}

        <FormSetup />

        <div className="pusat-kaki">
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}
