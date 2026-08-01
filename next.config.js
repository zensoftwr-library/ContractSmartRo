/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["puppeteer"],
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;