import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div>
      <h1>Bot not found</h1>
      <p className="muted">
        That bot does not exist, or it belongs to another account.
      </p>
      <Link className="btn" href="/dashboard">Back to your bots</Link>
    </div>
  );
}
