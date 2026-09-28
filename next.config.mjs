/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint dijalankan terpisah, jangan sampai menggagalkan build di Vercel.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
