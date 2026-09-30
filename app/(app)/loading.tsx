export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="sk sk-title" />
          <div className="sk sk-sub" />
        </div>
        <div className="sk sk-button" />
      </header>

      <div className="content">
        <div className="stat-grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="stat" key={i}>
              <div className="sk sk-label" />
              <div className="sk sk-number" />
              <div className="sk sk-foot" />
            </div>
          ))}
        </div>

        <div className="charts-grid">
          {[0, 1].map((i) => (
            <div className="card" key={i}>
              <div className="card-head">
                <div>
                  <div className="sk sk-title" />
                  <div className="sk sk-sub" />
                </div>
              </div>
              <div className="card-body">
                <div className="sk sk-chart" />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <div className="sk sk-title" />
          </div>
          <div className="card-body">
            {[0, 1, 2, 3, 4].map((i) => (
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
