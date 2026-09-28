'use client';

import { useActionState } from 'react';
import {
  tambahPenggunaAction,
  resetPasswordAction,
  type HasilForm,
} from '@/actions/pengguna';

export function FormPenggunaBaru() {
  const [keadaan, kirim, sedang] = useActionState<HasilForm, FormData>(
    tambahPenggunaAction,
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

      <div className="grid-2">
        <div className="field">
          <label htmlFor="username">Username login</label>
          <input
            id="username"
            name="username"
            type="text"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="misalnya: budi"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="role">Peran</label>
          <select id="role" name="role" defaultValue="operator">
            <option value="operator">Operator — hanya isi data akun</option>
            <option value="admin">Admin — boleh kelola pengguna</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">Password awal</label>
        <input
          id="password"
          name="password"
          type="text"
          autoComplete="off"
          placeholder="minimal 8 karakter"
          required
        />
        <span className="petunjuk">
          Sampaikan ke yang bersangkutan. Dia wajib menggantinya saat login pertama.
        </span>
      </div>

      <button className="btn btn-utama" disabled={sedang}>
        {sedang ? 'Membuat…' : 'Buat akun'}
      </button>
    </form>
  );
}

export function FormResetPassword({ id }: { id: string }) {
  const [keadaan, kirim, sedang] = useActionState<HasilForm, FormData>(
    resetPasswordAction,
    null
  );

  return (
    <form action={kirim}>
      <input type="hidden" name="id" value={id} />
      {keadaan?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{keadaan.error}</span>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor={`pw-${id}`}>Password baru</label>
        <input
          id={`pw-${id}`}
          name="password"
          type="text"
          autoComplete="off"
          placeholder="minimal 8 karakter"
          required
        />
      </div>
      <button className="btn btn-kecil" disabled={sedang}>
        {sedang ? 'Menyimpan…' : 'Setel ulang password'}
      </button>
    </form>
  );
}
