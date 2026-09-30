/**
 * Placeholder shaped like the account form, shown while the spreadsheet is
 * being read. Without this the "Add Account" page inherits the customer-list
 * skeleton, so the layout appears to jump when the real form arrives.
 */
export default function FormSkeleton() {
  const pair = (key: number) => (
    <div key={key}>
      <div className="sk sk-label" style={{ marginBottom: 8 }} />
      <div className="sk sk-field" />
    </div>
  );

  return (
    <>
      <header className="topbar">
        <div>
          <div className="sk sk-title" />
          <div className="sk sk-sub" />
        </div>
        <div className="sk sk-button" />
      </header>

      <div className="content" data-skeleton="form">
        <div className="card">
          <div className="card-body">
            <div className="grid-2">{[0, 1].map(pair)}</div>
            <div className="grid-2" style={{ marginTop: 16 }}>
              {[2, 3].map(pair)}
            </div>

            <div className="divider" style={{ margin: '24px 0 20px' }} />
            <div className="sk sk-label" style={{ marginBottom: 16 }} />

            <div className="grid-3">{[4, 5, 6].map(pair)}</div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <div className="sk sk-button" />
              <div className="sk sk-button" style={{ width: 80 }} />
            </div>
          </div>
        </div>

        <p className="text-small text-muted" style={{ textAlign: 'center', marginTop: 18 }}>
          Asking Google Sheets for the latest data…
        </p>
      </div>
    </>
  );
}
