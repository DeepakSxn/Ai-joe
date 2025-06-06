/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'cdn.heygen.com',
      'api.heygen.com',
      'heygen.com',
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize CSS loading
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    return config;
  },
}

module.exports = nextConfig 