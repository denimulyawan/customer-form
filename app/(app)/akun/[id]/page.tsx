import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormAkun from '@/components/FormAkun';
import { ubahAkunAction } from '@/actions/akun';
import { daftarAkun } from '@/lib/data';
import { tampilkanTanggal } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function HalamanEditAkun({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const akun = (await daftarAkun()).find((a) => a.id === id);

  if (!akun) notFound();

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Edit Akun</h1>
          <p>
            {akun.nama_pelanggan || 'Tanpa nama'} · terakhir dicatat{' '}
            {tampilkanTanggal(akun.tanggal_input)}
          </p>
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
              aksi={ubahAkunAction}
              labelTombol="Simpan perubahan"
              awal={{
                id: akun.id,
                nama_pelanggan: akun.nama_pelanggan,
                username: akun.username,
                email_solarwinds: akun.email_solarwinds,
                email_duo: akun.email_duo,
                pic: akun.pic,
                tanggal_input: akun.tanggal_input,
              }}
            />
          </div>
        </div>

        <p className="teks-kecil" style={{ marginTop: 14 }}>
          Untuk menghapus data ini, buka{' '}
          <Link href="/akun">daftar akun</Link> dan gunakan tombol Hapus pada barisnya.
        </p>
      </div>
    </>
  );
}
