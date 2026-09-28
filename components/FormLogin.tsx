'use client';

import { useActionState } from 'react';
import { masukAction, type HasilForm } from '@/actions/auth';

export default function FormLogin() {
  const [keadaan, kirim, sedang] = useActionState<HasilForm, FormData>(
    masukAction,
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
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <button className="btn btn-utama btn-lebar" disabled={sedang}>
        {sedang ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}
