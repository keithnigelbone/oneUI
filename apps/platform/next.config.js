/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Disabled in dev to prevent double-renders. Enable for production.
  reactStrictMode: false,

  // Vercel's 8 GB build container OOMs during Next's integrated ESLint pass on
  // this app. CI/local quality gates run lint independently, so keep deploy
  // builds focused on compiling the app and generating the Next output.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  serverExternalPackages: ['esbuild', 'playwright', 'playwright-core'],

  transpilePackages: [
    '@oneui/ui',
    '@oneui/tokens',
    '@oneui/shared',
    '@oneui/experience-builder-core',
    '@oneui/experience-builder-agents',
    '@oneui/experience-builder-export',
    '@oneui/experience-builder-preview',
  ],

  // Fix: Turbopack inlines CSS as <style> tags, so next/font's relative font URLs
  // (e.g., "../media/abc.woff2") resolve against the page URL instead of the CSS file
  // location. This rewrite serves font files from /media/* as if they were at
  // /_next/static/media/* — matching what the browser expects.
  async headers() {
    const corsReadableAssetHeaders = [
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
    ];

    return [
      '/jio-icons-data.json',
      '/fonts/:path*',
      '/_next/static/media/:path*',
      '/__nextjs_font/:path*',
      '/media/:path*',
    ].map((source) => ({
      source,
      headers: corsReadableAssetHeaders,
    }));
  },

  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/_next/static/media/:path*',
      },
    ];
  },

  // Permanent redirects for routes that moved in the Agents refactor.
  // Tone of Voice used to live under /brand/voice/* when it was a brand
  // sub-tool; it's now a sub-agent under /agents/tone-of-voice/*. Keep
  // bookmarks, shared links, and search engine entries working by
  // issuing 308 permanent redirects at the edge.
  async redirects() {
    return [
      {
        source: '/brand/voice',
        destination: '/agents/tone-of-voice',
        permanent: true,
      },
      {
        source: '/brand/voice/:path*',
        destination: '/agents/tone-of-voice/:path*',
        permanent: true,
      },
    ];
  },

  // Re-enabled after Phase 2 of the component-library audit. The `@oneui/ui`
  // barrel re-exports 152 entries from ~50 component folders; on every page
  // import Next had to walk the whole graph to figure out which subset was
  // actually used. With Vercel's 8 GB build memory cap this used to OOM, which
  // is why the option was disabled. The codemod
  // (`pnpm codemod:oneui-barrel`) now rewrites every consumer to deep
  // path-based imports (`@oneui/ui/components/Button`, etc.), and
  // `pnpm check:oneui-barrel` runs in CI to guarantee the barrel stays unused.
  // That makes Next's analysis cheap enough to enable safely.
  experimental: {
    optimizePackageImports: ['@oneui/ui', '@oneui/shared'],
  },

  // Turbopack configuration (used with next dev --turbopack)
  turbopack: {
    // Turbopack handles file watching natively with better performance
    // No additional configuration needed - uses Rust-based incremental compilation
  },

  // Webpack configuration for production builds (Turbopack is dev-only for now)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Increase polling interval to reduce CPU usage
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300, // Wait 300ms after changes before rebuilding
        ignored: ['**/node_modules/**', '**/.git/**'],
      };
    } else {
      // Disable filesystem cache entirely on Vercel — the cache adds significant
      // memory overhead (201kiB+ string serialization) and Vercel always builds fresh.
      // This prevents the OOM that was killing the build at 7+ minutes.
      config.cache = false;
    }

    // experience-builder-preview uses server-only native modules (esbuild, playwright).
    // Externalizing them prevents webpack from trying to bundle Node.js internals
    // when transpilePackages pulls the preview package through the client graph.
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'esbuild',
        'playwright',
        'playwright-core',
      ];
    }

    return config;
  },
};

module.exports = nextConfig;
