import Link from 'next/link';
import Pesan from '@/components/Pesan';
import TombolHapus from '@/components/TombolHapus';
import { hapusAkunAction } from '@/actions/akun';
import { daftarAkun } from '@/lib/data';
import { tampilkanTanggal } from '@/lib/format';
import type { Akun } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PER_HALAMAN = 25;

function cocok(a: Akun, q: string, pic: string, tanggal: string): boolean {
  if (q) {
    const gabung = [
      a.nama_pelanggan,
      a.username,
      a.email_solarwinds,
      a.email_duo,
      a.pic,
    ]
      .join(' ')
      .toLowerCase();
    if (!gabung.includes(q.toLowerCase())) return false;
  }
  if (pic && (a.pic ?? '').trim() !== pic) return false;
  if (tanggal && a.tanggal_input !== tanggal) return false;
  return true;
}

function buatQuery(isi: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  Object.entries(isi).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export default async function HalamanAkun({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    pic?: string;
    tanggal?: string;
    hal?: string;
    pesan?: string;
    e?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const pic = (sp.pic ?? '').trim();
  const tanggal = (sp.tanggal ?? '').trim();

  const semua = await daftarAkun();

  const daftarPic = Array.from(
    new Set(semua.map((a) => (a.pic ?? '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const hasil = semua
    .filter((a) => cocok(a, q, pic, tanggal))
    .sort((a, b) => String(b.tanggal_input).localeCompare(String(a.tanggal_input)));

  const totalHasil = hasil.length;
  const totalHalaman = Math.max(1, Math.ceil(totalHasil / PER_HALAMAN));
  const hal = Math.min(Math.max(1, Number(sp.hal) || 1), totalHalaman);
  const mulai = (hal - 1) * PER_HALAMAN;
  const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

  const adaFilter = Boolean(q || pic || tanggal);
  const tautanExport = `/api/export${buatQuery({ q, pic, tanggal })}`;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Daftar Akun</h1>
          <p>
            {totalHasil} dari {semua.length} akun
            {adaFilter ? ' (terfilter)' : ''}.
          </p>
        </div>
        <div className="topbar-aksi">
          <a className="btn" href={tautanExport}>
            ⤓ Export Excel
          </a>
          <Link className="btn btn-utama" href="/akun/baru">
            + Tambah Akun
          </Link>
        </div>
      </header>

      <div className="content">
        <Pesan sp={sp} />

        <div className="card">
          <div className="card-body">
            <form className="pencarian" action="/akun" method="get">
              <div className="field cari">
                <label htmlFor="q">Cari</label>
                <input
                  id="q"
                  name="q"
                  type="text"
                  defaultValue={q}
                  placeholder="nama pelanggan, username, email, atau PIC"
                />
              </div>

              <div className="field">
                <label htmlFor="pic">PIC</label>
                <select id="pic" name="pic" defaultValue={pic}>
                  <option value="">Semua PIC</option>
                  {daftarPic.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="tanggal">Tanggal Input</label>
                <input
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  defaultValue={tanggal}
                />
              </div>

              <button className="btn btn-utama" type="submit">
                Terapkan
              </button>

              {adaFilter ? (
                <Link className="btn" href="/akun">
                  Bersihkan
                </Link>
              ) : null}
            </form>
          </div>
        </div>

        <div className="card">
          {tampil.length === 0 ? (
            <div className="kosong">
              <div className="ikon-besar">▤</div>
              <h3>{adaFilter ? 'Tidak ada yang cocok' : 'Belum ada data'}</h3>
              <p>
                {adaFilter
                  ? 'Coba ubah kata kunci atau bersihkan filter.'
                  : 'Belum ada akun pelanggan yang tercatat di spreadsheet.'}
              </p>
              {adaFilter ? (
                <Link className="btn" href="/akun">
                  Bersihkan filter
                </Link>
              ) : (
                <Link className="btn btn-utama" href="/akun/baru">
                  + Tambah Akun Pertama
                </Link>
              )}
            </div>
          ) : (
            <>
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
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tampil.map((a) => (
                      <tr key={a.id}>
                        <td className="sel-utama">{a.nama_pelanggan || '—'}</td>
                        <td className="mono">{a.username || '—'}</td>
                        <td className="mono">{a.email_solarwinds || '—'}</td>
                        <td className="mono">{a.email_duo || '—'}</td>
                        <td>{a.pic || '—'}</td>
                        <td className="sel-samar">
                          {tampilkanTanggal(a.tanggal_input)}
                        </td>
                        <td className="aksi">
                          <Link className="btn btn-kecil" href={`/akun/${a.id}`}>
                            Edit
                          </Link>
                          <TombolHapus
                            id={a.id}
                            judul={a.nama_pelanggan || '(tanpa nama pelanggan)'}
                            keterangan={`${a.username || 'tanpa username'} · ${
                              a.tanggal_input || 'tanpa tanggal'
                            }`}
                            aksi={hapusAkunAction}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalHalaman > 1 ? (
                <div className="card-head" style={{ borderTop: '1px solid var(--line)', borderBottom: 'none' }}>
                  <div className="teks-kecil">
                    Menampilkan {mulai + 1}–{Math.min(mulai + PER_HALAMAN, totalHasil)}{' '}
                    dari {totalHasil}
                  </div>
                  <div className="topbar-aksi">
                    {hal > 1 ? (
                      <Link
                        className="btn btn-kecil"
                        href={`/akun${buatQuery({ q, pic, tanggal, hal: hal - 1 })}`}
                      >
                        ← Sebelumnya
                      </Link>
                    ) : null}
                    <span className="teks-kecil">
                      Halaman {hal} / {totalHalaman}
                    </span>
                    {hal < totalHalaman ? (
                      <Link
                        className="btn btn-kecil"
                        href={`/akun${buatQuery({ q, pic, tanggal, hal: hal + 1 })}`}
                      >
                        Berikutnya →
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
