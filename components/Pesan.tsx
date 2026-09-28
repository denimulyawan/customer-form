const SUKSES: Record<string, string> = {
  ditambah: 'Data akun berhasil ditambahkan.',
  disimpan: 'Perubahan berhasil disimpan.',
  password:
    'Password berhasil disetel ulang. Pengguna akan diminta menggantinya saat login berikutnya.',
  status: 'Status pengguna berhasil diubah.',
  'password-diganti': 'Password kamu berhasil diganti.',
  'admin-dibuat': 'Admin pertama berhasil dibuat. Silakan masuk.',
};

const GALAT: Record<string, string> = {
  nonaktif: 'Akun kamu sedang dinonaktifkan. Hubungi admin.',
  bukanadmin: 'Halaman itu khusus untuk admin.',
  'diri-sendiri': 'Kamu tidak bisa menonaktifkan akunmu sendiri.',
  'admin-terakhir':
    'Ini satu-satunya admin yang masih aktif, jadi tidak bisa dinonaktifkan.',
  gagal: 'Terjadi kesalahan saat menyimpan. Coba lagi.',
  'tidak-ada': 'Data yang dimaksud tidak ditemukan.',
};

export default function Pesan({
  sp,
}: {
  sp: { pesan?: string; e?: string };
}) {
  const sukses = sp.pesan ? SUKSES[sp.pesan] : undefined;
  const galat = sp.e ? GALAT[sp.e] : undefined;

  if (!sukses && !galat) return null;

  return (
    <>
      {sukses ? (
        <div className="alert alert-sukses">
          <span>✓</span>
          <span>{sukses}</span>
        </div>
      ) : null}
      {galat ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{galat}</span>
        </div>
      ) : null}
    </>
  );
}
