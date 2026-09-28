'use client';

import { useActionState } from 'react';
import {
  buatAdminPertamaAction,
  gantiPasswordAction,
  type HasilForm,
} from '@/actions/auth';

/* --------------------------- Admin pertama --------------------------- */

export function FormSetup() {
  const [keadaan, kirim, sedang] = useActionState<HasilForm, FormData>(
    buatAdminPertamaAction,
    null
  );

  return (
    <form action={kirim}>
      {keadaan?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{keadaan.error}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="username">Username admin</label>
        <input
          id="username"
          name="username"
          type="text"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="misalnya: deni"
          required
          autoFocus
        />
        <span className="petunjuk">
          3–20 karakter, huruf kecil/angka/titik/garis bawah/minus.
        </span>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <span className="petunjuk">Minimal 8 karakter.</span>
        </div>

        <div className="field">
          <label htmlFor="ulang">Ulangi password</label>
          <input
            id="ulang"
            name="ulang"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button className="btn btn-utama btn-lebar" disabled={sedang}>
        {sedang ? 'Membuat…' : 'Buat admin & mulai'}
      </button>
    </form>
  );
}

/* --------------------------- Ganti password --------------------------- */

export function FormGantiPassword({ paksa }: { paksa: boolean }) {
  const [keadaan, kirim, sedang] = useActionState<HasilForm, FormData>(
    gantiPasswordAction,
    null
  );

  return (
    <form action={kirim}>
      {keadaan?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{keadaan.error}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="lama">
          {paksa ? 'Password awal yang diberikan admin' : 'Password sekarang'}
        </label>
        <input
          id="lama"
          name="lama"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="baru">Password baru</label>
          <input
            id="baru"
            name="baru"
            type="password"
            autoComplete="new-password"
            required
          />
          <span className="petunjuk">Minimal 8 karakter, pilih yang mudah kamu ingat.</span>
        </div>

        <div className="field">
          <label htmlFor="ulang">Ulangi password baru</label>
          <input
            id="ulang"
            name="ulang"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button className="btn btn-utama" disabled={sedang}>
        {sedang ? 'Menyimpan…' : 'Simpan password baru'}
      </button>
    </form>
  );
}
