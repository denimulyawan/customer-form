/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint runs separately; never let it fail a Vercel build.
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    /**
     * How long the browser may reuse an already-loaded page before asking the
     * server again, in seconds.
     *
     * Every page here has to ask Google Sheets for data, which costs 1–3
     * seconds. Without this, moving between menus pays that price every single
     * time. With it, a page you opened in the last half minute appears
     * instantly and refreshes quietly in the background.
     *
     * Nothing is ever stale in a way that matters: saving anything calls
     * revalidatePath, which throws the cached copy away immediately.
     */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
