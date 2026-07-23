import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sjwnogqougyfkfwyrrbv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    deviceSizes: [640, 828, 1200],
    imageSizes: [96, 256, 384],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;