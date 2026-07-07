/** @type {import('next').NextConfig} */
module.exports = {
  // Middleware imports @supabase/ssr -> @supabase/supabase-js, which uses
  // Node APIs (process.version) unavailable in the Edge Runtime. Run it on
  // Node.js instead. Requires `runtime: 'nodejs'` in middleware.js's config.
  experimental: {
    nodeMiddleware: true,
  },
};
