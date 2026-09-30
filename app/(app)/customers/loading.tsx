export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Customer List</h1>
          <p>Reading data from the spreadsheet.</p>
        </div>
      </header>
      <div className="content">
        <div className="loader">
          <span className="loader-dot" />
          Loading
        </div>
      </div>
    </>
  );
}
