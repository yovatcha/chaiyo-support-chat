/** @type {import('next').NextConfig} */
module.exports = {
  // No middleware on purpose: running @supabase/ssr in Next middleware crashed
  // on Vercel (MIDDLEWARE_INVOCATION_FAILED, a bundled dep touched __dirname).
  // Auth is enforced in app/dashboard/layout.js and the session is kept fresh
  // by components/SessionKeeper.js in the browser.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // The widget is meant to be loaded cross-origin by any site.
        source: '/yo-bot.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};
