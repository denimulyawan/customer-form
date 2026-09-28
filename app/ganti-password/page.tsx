import Link from 'next/link';
import { FormGantiPassword } from '@/components/FormAkunAuth';
import { wajibPenggunaAktif } from '@/lib/auth';
import { MASA_BERLAKU_DETIK } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function HalamanGantiPassword({
  searchParams,
}: {
  searchParams: Promise<{ paksa?: string }>;
}) {
  const sp = await searchParams;
  const paksa = sp.paksa === '1';
  const { pengguna } = await wajibPenggunaAktif();

  const wajibGanti =
    paksa || pengguna.must_change_password === 'ya';

  return (
    <div className="pusat">
      <div className="pusat-kartu" style={{ maxWidth: 520 }}>
        <div className="brand">
          <span className="brand-mark">MA</span>
          <div className="brand-text">
            <strong>Manajemen Akun Pelanggan</strong>
            <small>{pengguna.username}</small>
          </div>
        </div>

        {wajibGanti ? (
          <>
            <h1>Ganti password dulu</h1>
            <p className="sub">
              Ini login pertamamu dengan password yang diberikan admin. Demi keamanan,
              ganti dulu dengan password pilihanmu sendiri sebelum melanjutkan.
            </p>
          </>
        ) : (
          <>
            <h1>Ganti password</h1>
            <p className="sub">
              Masukkan password sekarang, lalu password baru pilihanmu.
            </p>
          </>
        )}

        <FormGantiPassword paksa={wajibGanti} />

        {!wajibGanti ? (
          <div className="pusat-kaki">
            <Link href="/">← Kembali ke dashboard</Link>
          </div>
        ) : (
          <div className="pusat-kaki">
            Sesi login berlaku {Math.round(MASA_BERLAKU_DETIK / 3600)} jam setelah
            password diganti.
          </div>
        )}
      </div>
    </div>
  );
}
