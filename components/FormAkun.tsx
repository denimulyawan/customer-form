'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { AkunInput } from '@/lib/types';
import type { HasilForm } from '@/actions/akun';

type Props = {
  aksi: (keadaan: HasilForm, fd: FormData) => Promise<HasilForm>;
  awal: AkunInput & { id?: string };
  labelTombol: string;
};

export default function FormAkun({ aksi, awal, labelTombol }: Props) {
  const [keadaan, kirim, sedang] = useActionState<HasilForm, FormData>(aksi, null);

  return (
    <form action={kirim}>
      {awal.id ? <input type="hidden" name="id" value={awal.id} /> : null}

      {keadaan?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{keadaan.error}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="nama_pelanggan">Nama Pelanggan</label>
        <input
          id="nama_pelanggan"
          name="nama_pelanggan"
          type="text"
          defaultValue={awal.nama_pelanggan}
          placeholder="misalnya: PT Maju Jaya"
          required
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={awal.username}
          spellCheck={false}
          autoCapitalize="none"
          placeholder="misalnya: mjuajaya01"
          required
        />
        <span className="petunjuk">
          Boleh sama dengan data lain — tidak diperiksa keunikannya.
        </span>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="email_solarwinds">Email SolarWinds</label>
          <input
            id="email_solarwinds"
            name="email_solarwinds"
            type="text"
            defaultValue={awal.email_solarwinds}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="nama@contoh.com"
          />
        </div>

        <div className="field">
          <label htmlFor="email_duo">Email Duo (enrollment)</label>
          <input
            id="email_duo"
            name="email_duo"
            type="text"
            defaultValue={awal.email_duo}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="nama@contoh.com"
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="pic">PIC</label>
          <input
            id="pic"
            name="pic"
            type="text"
            defaultValue={awal.pic}
            placeholder="nama rekan internal yang menangani"
          />
        </div>

        <div className="field">
          <label htmlFor="tanggal_input">Tanggal Input</label>
          <input
            id="tanggal_input"
            name="tanggal_input"
            type="date"
            defaultValue={awal.tanggal_input}
          />
          <span className="petunjuk">Terisi otomatis hari ini, boleh diubah.</span>
        </div>
      </div>

      <div className="form-aksi">
        <button className="btn btn-utama" disabled={sedang}>
          {sedang ? 'Menyimpan…' : labelTombol}
        </button>
        <Link className="btn" href="/akun">
          Batal
        </Link>
      </div>
    </form>
  );
}
