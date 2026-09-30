export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="sk sk-title" />
          <div className="sk sk-sub" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="sk sk-button" />
          <div className="sk sk-button" />
        </div>
      </header>

      <div className="content" data-skeleton="list">
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="sk sk-field" style={{ flex: '2 1 260px' }} />
              <div className="sk sk-field" style={{ flex: '1 1 180px' }} />
              <div className="sk sk-button" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div className="sk sk-row" key={i} />
            ))}
          </div>
        </div>

        <p className="text-small text-muted" style={{ textAlign: 'center', marginTop: 18 }}>
          Asking Google Sheets for the latest data…
        </p>
      </div>
    </>
  );
}
