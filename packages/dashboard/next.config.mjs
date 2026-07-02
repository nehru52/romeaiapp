/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Build errors are caught by bun run typecheck in CI
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
