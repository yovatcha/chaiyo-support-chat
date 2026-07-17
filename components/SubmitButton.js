'use client';

import { useFormStatus } from 'react-dom';

// Disables itself while its form's action is in flight, so a slow round-trip
// to Supabase can't be double-submitted.
export default function SubmitButton({
  children,
  pendingLabel,
  className = 'btn',
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} aria-busy={pending}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
