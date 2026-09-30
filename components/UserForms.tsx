'use client';

import { useActionState } from 'react';
import {
  createUserAction,
  resetPasswordAction,
  type FormState,
} from '@/actions/users';

export function CreateUserForm() {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    createUserAction,
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

      <div className="grid-3">
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. budi"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="e.g. Budi Santoso"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue="operator">
            <option value="operator">Operator — records only</option>
            <option value="admin">Admin — also manages users</option>
          </select>
        </div>
      </div>

      <div className="grid-3">
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="text" placeholder="0812-3456-7890" />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="text"
            spellCheck={false}
            autoCapitalize="none"
            placeholder="name@company.com"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Initial password</label>
          <input
            id="password"
            name="password"
            type="text"
            autoComplete="off"
            placeholder="at least 8 characters"
            required
          />
        </div>
      </div>

      <p className="hint" style={{ marginTop: -4, marginBottom: 14 }}>
        Give the username and initial password to that person. They will be asked
        to change it at their first sign-in.
      </p>

      <button className="btn btn-primary" disabled={pending}>
        {pending ? 'Creating…' : 'Create user'}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    resetPasswordAction,
    null
  );

  return (
    <form action={submit}>
      <input type="hidden" name="id" value={id} />
      {state?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{state.error}</span>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor={`pw-${id}`}>New password</label>
        <input
          id={`pw-${id}`}
          name="password"
          type="text"
          autoComplete="off"
          placeholder="at least 8 characters"
          required
        />
      </div>
      <button className="btn btn-small" disabled={pending}>
        {pending ? 'Saving…' : 'Reset password'}
      </button>
    </form>
  );
}
