import Link from 'next/link';
import Pesan from '@/components/Pesan';
import { FormPenggunaBaru, FormResetPassword } from '@/components/FormPengguna';
import { ubahStatusAction } from '@/actions/pengguna';
import { wajibAdmin } from '@/lib/auth';
import { daftarPengguna } from '@/lib/data';
import { tampilkanWaktu } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function HalamanPengguna({
  searchParams,
}: {
  searchParams: Promise<{ pesan?: string; e?: string }>;
}) {
  const sp = await searchParams;
  const { pengguna: saya } = await wajibAdmin();
  const daftar = await daftarPengguna();

  const urut = [...daftar].sort((a, b) =>
    String(a.username).localeCompare(String(b.username))
  );

  const jumlahAdminAktif = urut.filter(
    (u) => u.role === 'admin' && u.status === 'aktif'
  ).length;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Pengguna</h1>
          <p>
            {urut.length} akun login · {jumlahAdminAktif} admin aktif
          </p>
        </div>
      </header>

      <div className="content">
        <Pesan sp={sp} />

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Buat akun baru</h2>
              <p>
                Berikan username dan password awal ke yang bersangkutan. Dia akan
                diminta menggantinya saat login pertama.
              </p>
            </div>
          </div>
          <div className="card-body">
            <FormPenggunaBaru />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Daftar akun login</h2>
              <p>Termasuk kapan terakhir kali masing-masing masuk.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Login terakhir</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {urut.map((u) => {
                  const diriSendiri = u.id === saya.id;
                  return (
                    <tr key={u.id}>
                      <td className="sel-utama mono">
                        {u.username}
                        {diriSendiri ? (
                          <span className="badge badge-abu" style={{ marginLeft: 8 }}>
                            kamu
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <span
                          className={
                            u.role === 'admin' ? 'badge badge-biru' : 'badge badge-abu'
                          }
                        >
                          {u.role === 'admin' ? 'Admin' : 'Operator'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            u.status === 'aktif' ? 'badge badge-hijau' : 'badge badge-kuning'
                          }
                        >
                          {u.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {u.must_change_password === 'ya' ? (
                          <>
                            {' '}
                            <span className="badge badge-kuning">Belum ganti password</span>
                          </>
                        ) : null}
                      </td>
                      <td className="sel-samar teks-kecil">
                        {tampilkanWaktu(u.last_login)}
                      </td>
                      <td className="aksi">
                        <details className="rincian" style={{ display: 'inline-block' }}>
                          <summary>Setel ulang password</summary>
                          <div className="isi" style={{ minWidth: 280 }}>
                            <FormResetPassword id={u.id} />
                          </div>
                        </details>

                        <form action={ubahStatusAction} style={{ display: 'inline-block' }}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={u.status === 'aktif' ? 'nonaktif' : 'aktif'}
                          />
                          <button
                            className="btn btn-kecil"
                            type="submit"
                            disabled={diriSendiri}
                            title={
                              diriSendiri
                                ? 'Kamu tidak bisa menonaktifkan akunmu sendiri'
                                : undefined
                            }
                          >
                            {u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="teks-kecil" style={{ marginTop: 14 }}>
          <Link href="/ganti-password">Ganti password akunmu sendiri</Link>
        </p>
      </div>
    </>
  );
}
