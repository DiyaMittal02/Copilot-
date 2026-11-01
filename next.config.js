/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Native addon — keep it out of the bundler so the route handler can load it.
  serverExternalPackages: ['@duckdb/node-api'],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
