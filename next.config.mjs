/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (already used)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Bing thumbnails (previous issue)
      { protocol: "https", hostname: "th.bing.com" },
      // Local API uploads (FastAPI /static/uploads)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/static/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/static/**",
      },
    ],
  },

  headers: async () => [
    {
      source: "/admin/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value:
            "frame-ancestors 'self'; frame-src 'self' https://app.powerbi.com https://*.powerbi.com;",
        },
      ],
    },
  ],

  // ⚠ Ignore toutes les erreurs TypeScript au build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ⚠ Ignore toutes les erreurs ESLint au build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
