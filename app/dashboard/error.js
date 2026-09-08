'use client';

// Catches anything thrown while rendering a dashboard page so a Supabase or
// network failure shows a retry instead of the framework's raw error page.
export default function DashboardError({ error, reset }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p className="error">
        {error?.message || 'The dashboard could not load. Please try again.'}
      </p>
      <button type="button" className="btn" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
