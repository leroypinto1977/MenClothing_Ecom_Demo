import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in the home dir confuses inference).
  turbopack: { root: process.cwd() },
  // Enables unauthorized()/forbidden() + app/unauthorized.tsx, app/forbidden.tsx.
  experimental: { authInterrupts: true },
  images: {
    // Unsplash URLs are already sized via query params; skip the optimizer so the
    // demo loads instantly and never hits an optimizer timeout while presenting.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
