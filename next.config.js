/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.0.119', '127.0.0.1', 'localhost'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
