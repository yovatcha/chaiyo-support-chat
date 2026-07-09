/** @type {import('next').NextConfig} */
module.exports = {
  // Middleware imports @supabase/ssr -> @supabase/supabase-js, which uses Node
  // APIs (process.version) unavailable in the Edge Runtime, so it must run on
  // the Node.js runtime. In Next.js 15.5+ that runtime is stable and enabled
  // solely by `export const config = { runtime: 'nodejs' }` in middleware.js —
  // no next.config flag is needed. (The old experimental.nodeMiddleware key is
  // now unrecognized and only produced an "Invalid next.config.js" warning.)
};
