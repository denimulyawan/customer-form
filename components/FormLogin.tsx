'use client';

import { useActionState } from 'react';
import { signInAction, type FormState } from '@/actions/auth';

export default function LoginForm() {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    signInAction,
    null
  );

  return (
    <form action={submit}>
      {state?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{state.error}</span>
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

      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
