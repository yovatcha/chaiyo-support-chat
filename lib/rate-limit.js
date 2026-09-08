// Best-effort in-memory rate limiting for the public endpoints.
//
// This state lives inside one function instance, so it is NOT a hard limit on
// Vercel (instances come and go, and concurrent instances do not share it).
// It stops casual abuse and runaway widgets; the real ceiling should be a
// platform rule (Vercel WAF rate limiting) or a shared store such as Upstash
// Redis. Both endpoints use it in the same way, hence the shared helper.

const MAX_KEYS = 5000;

export function createLimiter({ limit, windowMs }) {
  const hits = new Map(); // key -> [timestamps of ACCEPTED requests]

  function prune(now) {
    if (hits.size <= MAX_KEYS) return;
    // Drop the oldest-touched keys instead of wiping everyone's counters.
    for (const [key, list] of hits) {
      if (list.length === 0 || now - list[list.length - 1] > windowMs) hits.delete(key);
      if (hits.size <= MAX_KEYS / 2) break;
    }
    if (hits.size > MAX_KEYS) {
      const excess = hits.size - MAX_KEYS / 2;
      let i = 0;
      for (const key of hits.keys()) {
        if (i++ >= excess) break;
        hits.delete(key);
      }
    }
  }

  // Returns true when the request must be rejected. Rejected requests do not
  // count toward the window, so a throttled client is not throttled harder for
  // retrying — the block ends when the window does.
  return function limited(key) {
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= limit) {
      hits.set(key, list);
      return true;
    }
    list.push(now);
    hits.set(key, list);
    prune(now);
    return false;
  };
}

// Vercel sets x-real-ip to the connecting client. x-forwarded-for's first hop
// is the fallback for other hosts.
export function clientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}
