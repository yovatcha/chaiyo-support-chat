// Landing point for Supabase email links built from the server-side auth
// template ({{ .TokenHash }}). Same handler as /auth/callback.

import { completeAuthRedirect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return completeAuthRedirect(request);
}
