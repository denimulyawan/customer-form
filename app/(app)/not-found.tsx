import Link from 'next/link';

export default function TidakDitemukan() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Data tidak ditemukan</h1>
          <p>Baris yang kamu cari sudah tidak ada di spreadsheet.</p>
        </div>
      </header>
      <div className="content">
        <div className="card">
          <div className="kosong">
            <div className="ikon-besar">?</div>
            <h3>Datanya tidak ada</h3>
            <p>
              Kemungkinan baris ini sudah dihapus oleh orang lain, atau id-nya tidak
              cocok. Coba cari ulang dari daftar akun.
            </p>
            <Link className="btn btn-utama" href="/akun">
              Ke Daftar Akun
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
