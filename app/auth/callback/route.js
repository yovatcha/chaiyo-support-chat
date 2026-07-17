// Landing point for Supabase email links (default `?code=` templates).
// See lib/auth.js — /auth/confirm is the same handler under the name the
// token_hash email template expects.

import { completeAuthRedirect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return completeAuthRedirect(request);
}
