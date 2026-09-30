import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Record not found</h1>
          <p>The row you were looking for is no longer in the spreadsheet.</p>
        </div>
      </header>
      <div className="content">
        <div className="card">
          <div className="empty">
            <div className="empty-icon">?</div>
            <h3>Nothing to show</h3>
            <p>
              It may have been deleted by someone else, or the link is wrong. Try
              searching again from the customer list.
            </p>
            <Link className="btn btn-primary" href="/customers">
              Go to Customer List
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
