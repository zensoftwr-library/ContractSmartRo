/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
};

export default nextConfig;