/** @type {import('next').NextConfig} */
module.exports = {
  // Nothing to configure: the Supabase auth middleware runs on the default Edge
  // runtime (see middleware.js). The previous experimental.nodeMiddleware flag
  // was removed — it was unrecognized in Next 15.5 and the Node.js middleware it
  // enabled crashed on Vercel (MIDDLEWARE_INVOCATION_FAILED).
};
