'use client';

import { useActionState } from 'react';
import {
  changePasswordAction,
  createFirstAdminAction,
  updateProfileAction,
  type FormState,
} from '@/actions/auth';

/* ========================= First run / recovery ========================= */

export function FirstAdminForm() {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    createFirstAdminAction,
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

      <div className="grid-2">
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. deni"
            required
            autoFocus
          />
          <span className="hint">3–20 characters, lowercase.</span>
        </div>

        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" type="text" required />
          <span className="hint">Shown as the Account Manager name.</span>
        </div>
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
          <span className="hint">At least 8 characters.</span>
        </div>

        <div className="field">
          <label htmlFor="repeat">Repeat password</label>
          <input
            id="repeat"
            name="repeat"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? 'Creating…' : 'Create admin account'}
      </button>
    </form>
  );
}

/* ============================== My account ============================== */

export function ProfileForm({
  full_name,
  phone,
  email,
}: {
  full_name: string;
  phone: string;
  email: string;
}) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    updateProfileAction,
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
      {state?.success ? (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{state.success}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" type="text" defaultValue={full_name} required />
        <span className="hint">
          This is the name shown as Account Manager on customer records.
        </span>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={phone}
            placeholder="e.g. 0812-3456-7890"
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="text"
            defaultValue={email}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="name@company.com"
          />
        </div>
      </div>

      <button className="btn btn-primary" disabled={pending}>
        {pending ? 'Saving…' : 'Save details'}
      </button>
    </form>
  );
}

export function PasswordForm({ forced = false }: { forced?: boolean }) {
  const [state, submit, pending] = useActionState<FormState, FormData>(
    changePasswordAction,
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
      {state?.success ? (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{state.success}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="current">
          {forced ? 'Password given to you by the admin' : 'Current password'}
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="next">New password</label>
          <input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            required
          />
          <span className="hint">At least 8 characters.</span>
        </div>

        <div className="field">
          <label htmlFor="repeat">Repeat new password</label>
          <input
            id="repeat"
            name="repeat"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button className="btn btn-primary" disabled={pending}>
        {pending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
