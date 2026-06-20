import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reuse a visited route from the client Router Cache for 30s before
    // refetching. Kills the re-skeleton flash when navigating back to a page
    // (e.g. bookings → payouts → bookings). Mutations call router.refresh(),
    // which bypasses this cache, so post-write data stays fresh.
    staleTimes: { dynamic: 30, static: 180 },
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/auth/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/auth/:path*`,
        },
        {
          source: '/api/v1/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1/:path*`,
        },
      ],
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: process.env.NEXT_PUBLIC_CDN_HOST ?? "cdn.stub.invalid" },
    ],
  },
};

export default nextConfig;
