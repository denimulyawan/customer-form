'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary for anything the pages themselves did not catch.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error in the app group:', error);
  }, [error]);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Something went wrong</h1>
          <p>This page could not be loaded.</p>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-error">
              <span>!</span>
              <div>
                <strong>The page failed to render</strong>
                {error.message || 'No further detail was provided.'}
                {error.digest ? (
                  <>
                    <br />
                    <span className="mono text-small">Digest: {error.digest}</span>
                  </>
                ) : null}
              </div>
            </div>

            <p className="text-small">
              If this keeps happening, check the deployment logs in Vercel under{' '}
              <strong>Deployments → Functions</strong>, and make sure the Apps Script
              code has been updated and deployed.
            </p>

            <div className="form-actions">
              <button className="btn btn-primary" type="button" onClick={reset}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
