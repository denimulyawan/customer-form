'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { CustomerInput } from '@/lib/types';
import type { FormState } from '@/actions/customers';

export type ManagerOption = {
  username: string;
  label: string;
};

type Props = {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  initial: CustomerInput & { id?: string };
  managers: ManagerOption[];
  submitLabel: string;
};

export default function CustomerForm({
  action,
  initial,
  managers,
  submitLabel,
}: Props) {
  const [state, submit, pending] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={submit}>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state?.error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label htmlFor="company_name">Customer Company Name</label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            defaultValue={initial.company_name}
            placeholder="e.g. PT Maju Jaya"
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="cid">CID</label>
          <input
            id="cid"
            name="cid"
            type="text"
            defaultValue={initial.cid}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="e.g. CID-00123"
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="account_username">Account Username</label>
          <input
            id="account_username"
            name="account_username"
            type="text"
            defaultValue={initial.account_username}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="e.g. mjuajaya01"
            required
          />
          <span className="hint">
            Duplicates are allowed — no uniqueness check.
          </span>
        </div>

        <div className="field">
          <label htmlFor="am_username">Account Manager</label>
          <select
            id="am_username"
            name="am_username"
            defaultValue={initial.am_username}
            required
          >
            <option value="">— Select an Account Manager —</option>
            {managers.map((m) => (
              <option key={m.username} value={m.username}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="hint">
            Chosen from User Management. Their contact details follow the account.
          </span>
        </div>
      </div>

      <div className="divider" />

      <h3 className="section-title">PIC — Customer Contact</h3>

      <div className="grid-3">
        <div className="field">
          <label htmlFor="pic_name">Name</label>
          <input
            id="pic_name"
            name="pic_name"
            type="text"
            defaultValue={initial.pic_name}
            placeholder="e.g. Budi Santoso"
          />
        </div>

        <div className="field">
          <label htmlFor="pic_phone">Phone</label>
          <input
            id="pic_phone"
            name="pic_phone"
            type="text"
            defaultValue={initial.pic_phone}
            placeholder="e.g. 0812-3456-7890"
          />
        </div>

        <div className="field">
          <label htmlFor="pic_email">Email</label>
          <input
            id="pic_email"
            name="pic_email"
            type="text"
            defaultValue={initial.pic_email}
            spellCheck={false}
            autoCapitalize="none"
            placeholder="name@customer.com"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link className="btn" href="/customers">
          Cancel
        </Link>
      </div>
    </form>
  );
}
