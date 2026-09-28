'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  id: string;
  judul: string;
  keterangan: string;
  aksi: (id: string) => Promise<void>;
};

export default function TombolHapus({ id, judul, keterangan, aksi }: Props) {
  const [buka, setBuka] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sedang, mulai] = useTransition();
  const router = useRouter();

  function jalankan() {
    setGalat(null);
    mulai(async () => {
      try {
        await aksi(id);
        setBuka(false);
        router.refresh();
      } catch (e) {
        setGalat(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-kecil btn-bahaya-lembut"
        onClick={() => {
          setGalat(null);
          setBuka(true);
        }}
      >
        Hapus
      </button>

      {buka ? (
        <div className="modal-latar" onClick={() => (sedang ? null : setBuka(false))}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Yakin hapus data ini?</h3>
            <div className="nama">
              <strong>{judul}</strong>
              <br />
              <span className="teks-samar mono">{keterangan}</span>
            </div>
            <p>
              Data ini akan dihapus permanen dari spreadsheet. Tindakan ini{' '}
              <strong>tidak bisa dibatalkan</strong>.
            </p>

            {galat ? (
              <div className="alert alert-error" style={{ marginTop: 14, marginBottom: 0 }}>
                <span>!</span>
                <span>{galat}</span>
              </div>
            ) : null}

            <div className="modal-aksi">
              <button
                type="button"
                className="btn"
                onClick={() => setBuka(false)}
                disabled={sedang}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-bahaya"
                onClick={jalankan}
                disabled={sedang}
              >
                {sedang ? 'Menghapus…' : 'Ya, hapus permanen'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
