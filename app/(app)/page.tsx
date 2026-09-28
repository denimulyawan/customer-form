import Link from 'next/link';
import Pesan from '@/components/Pesan';
import { daftarAkun } from '@/lib/data';
import { hariIni, tampilkanTanggal } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ pesan?: string; e?: string }>;
}) {
  const sp = await searchParams;
  const akun = await daftarAkun();

  const total = akun.length;

  const pelanggan = new Set(
    akun.map((a) => (a.nama_pelanggan ?? '').trim().toLowerCase()).filter(Boolean)
  ).size;

  const pic = new Set(
    akun.map((a) => (a.pic ?? '').trim().toLowerCase()).filter(Boolean)
  ).size;

  const hariIniStr = hariIni();
  const masukHariIni = akun.filter((a) => a.tanggal_input === hariIniStr).length;

  const terbaru = [...akun]
    .sort((a, b) => String(b.tanggal_input).localeCompare(String(a.tanggal_input)))
    .slice(0, 8);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan akun pelanggan yang tercatat.</p>
        </div>
        <div className="topbar-aksi">
          <Link className="btn btn-utama" href="/akun/baru">
            + Tambah Akun
          </Link>
        </div>
      </header>

      <div className="content">
        <Pesan sp={sp} />

        <div className="stat-grid">
          <div className="stat biru">
            <div className="label">Total Akun</div>
            <div className="angka">{total}</div>
            <div className="kaki">seluruh baris di tab akun</div>
          </div>

          <div className="stat">
            <div className="label">Jumlah Pelanggan</div>
            <div className="angka">{pelanggan}</div>
            <div className="kaki">nama pelanggan yang berbeda</div>
          </div>

          <div className="stat">
            <div className="label">Diinput Hari Ini</div>
            <div className="angka">{masukHariIni}</div>
            <div className="kaki">{tampilkanTanggal(hariIniStr)}</div>
          </div>

          <div className="stat">
            <div className="label">Jumlah PIC</div>
            <div className="angka">{pic}</div>
            <div className="kaki">rekan internal yang tercatat</div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Entri terbaru</h2>
              <p>Delapan data dengan tanggal input terakhir.</p>
            </div>
            <Link className="btn btn-kecil" href="/akun">
              Lihat semua
            </Link>
          </div>

          {terbaru.length === 0 ? (
            <div className="kosong">
              <div className="ikon-besar">▤</div>
              <h3>Belum ada data</h3>
              <p>
                Spreadsheet-nya masih kosong. Mulai dengan menambahkan akun pelanggan
                pertama.
              </p>
              <Link className="btn btn-utama" href="/akun/baru">
                + Tambah Akun Pertama
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nama Pelanggan</th>
                    <th>Username</th>
                    <th>Email SolarWinds</th>
                    <th>Email Duo</th>
                    <th>PIC</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {terbaru.map((a) => (
                    <tr key={a.id}>
                      <td className="sel-utama">{a.nama_pelanggan || '—'}</td>
                      <td className="mono">{a.username || '—'}</td>
                      <td className="mono">{a.email_solarwinds || '—'}</td>
                      <td className="mono">{a.email_duo || '—'}</td>
                      <td>{a.pic || '—'}</td>
                      <td className="sel-samar">{tampilkanTanggal(a.tanggal_input)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
