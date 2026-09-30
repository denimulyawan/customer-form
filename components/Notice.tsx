const SUCCESS: Record<string, string> = {
  created: 'The record has been added.',
  saved: 'Your changes have been saved.',
  password: 'The password has been reset. The user must change it at the next sign-in.',
  status: 'The user status has been updated.',
  profile: 'Your details have been saved.',
  changed: 'Your password has been changed.',
  'first-admin': 'The first admin account has been created. Please sign in.',
};

const ERRORS: Record<string, string> = {
  inactive: 'Your account is deactivated. Please contact your admin.',
  notadmin: 'That page is for admins only.',
  self: 'You cannot deactivate your own account.',
  lastadmin: 'This is the only active admin, so it cannot be deactivated.',
  notfound: 'That record could not be found.',
  failed: 'Something went wrong while saving. Please try again.',
};

export default function Notice({ msg, e }: { msg?: string; e?: string }) {
  const success = msg ? SUCCESS[msg] : undefined;
  const error = e ? ERRORS[e] : undefined;

  if (!success && !error) return null;

  return (
    <>
      {success ? (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      ) : null}
      {error ? (
        <div className="alert alert-error">
          <span>!</span>
          <span>{error}</span>
        </div>
      ) : null}
    </>
  );
}
