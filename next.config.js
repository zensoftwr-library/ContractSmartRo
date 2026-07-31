/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
};

export default nextConfig;