const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pkg = require('../../package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  publicRuntimeConfig: {
    version: pkg.version,
  },
  transpilePackages: [
    '@chaindesk/lib',
    '@chaindesk/emails',
    '@chaindesk/ui',
    '@chaindesk/integrations',
  ],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: '../../packages/ui/src/**/static/**',
            to({ context, absoluteFilename }) {
              const appName = /ui\/src\/static\/(.*)\//.exec(absoluteFilename);
              return `${context}/public/shared/${appName[1]}/[name][ext]`;
            },
          },
          {
            from: '../../packages/integrations/**/static/**',
            to({ context, absoluteFilename }) {
              const appName = /integrations\/(.*)\/static/.exec(absoluteFilename);
              return `${context}/public/integrations/${appName[1]}/[name][ext]`;
            },
          },
        ],
      })
    );

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);

if (process.env.SENTRY_ORGANIZATION) {
  const { withSentryConfig } = require('@sentry/nextjs');

  module.exports = withSentryConfig(
    module.exports,
    {
      silent: true,
      org: process.env.SENTRY_ORGANIZATION,
      project: 'javascript-nextjs',
    },
    {
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
    }
  );
}
