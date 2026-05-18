import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/blogs',
        permanent: true,
      },
      {
        source: '/:locale/blog',
        destination: '/:locale/blogs',
        permanent: true,
      },
      {
        source: '/blogs/:id',
        destination: '/blog/:id',
        permanent: true,
      },
      {
        source: '/:locale/blogs/:id',
        destination: '/:locale/blog/:id',
        permanent: true,
      },
      {
        source: '/product/:id',
        destination: '/shop/product/:id',
        permanent: true,
      },
      {
        source: '/:locale/product/:id',
        destination: '/:locale/shop/product/:id',
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default withSentryConfig(
  withNextIntl(nextConfig),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-javascript/blob/master/packages/nextjs/src/config/types.ts
    org: process.env.SENTRY_ORG || 'merigaumata',
    project: process.env.SENTRY_PROJECT || 'merigaumata',

    // Only print logs when in development or debugging
    silent: true,

    // Upload source maps for client, server and edge
    widenClientFileUpload: true,
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    webpack: {
      treeshake: {
        removeDebugLogging: true,
      },
    },
  }
);
