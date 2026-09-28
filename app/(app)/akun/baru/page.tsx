import Link from 'next/link';
import FormAkun from '@/components/FormAkun';
import { tambahAkunAction } from '@/actions/akun';
import { hariIni } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function HalamanTambahAkun() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Tambah Akun</h1>
          <p>Catat akun pelanggan baru. Kolom bertanda wajib harus diisi.</p>
        </div>
        <div className="topbar-aksi">
          <Link className="btn" href="/akun">
            ← Kembali
          </Link>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-body">
            <FormAkun
              aksi={tambahAkunAction}
              labelTombol="Simpan akun"
              awal={{
                nama_pelanggan: '',
                username: '',
                email_solarwinds: '',
                email_duo: '',
                pic: '',
                tanggal_input: hariIni(),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
