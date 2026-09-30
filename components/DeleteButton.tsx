'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  id: string;
  title: string;
  subtitle: string;
  action: (id: string) => Promise<void>;
};

export default function DeleteButton({ id, title, subtitle, action }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        await action(id);
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-small btn-danger-soft"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Delete
      </button>

      {open ? (
        <div className="modal-backdrop" onClick={() => (pending ? null : setOpen(false))}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this record?</h3>
            <div className="modal-subject">
              <strong>{title}</strong>
              <br />
              <span className="text-muted mono">{subtitle}</span>
            </div>
            <p>
              This removes the row from the spreadsheet permanently. It{' '}
              <strong>cannot be undone</strong>.
            </p>

            {error ? (
              <div className="alert alert-error" style={{ marginTop: 14, marginBottom: 0 }}>
                <span>!</span>
                <span>{error}</span>
              </div>
            ) : null}

            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={run}
                disabled={pending}
              >
                {pending ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
