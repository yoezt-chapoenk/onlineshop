import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.juragangrosir.com",
      },
    ],
  },
};

export default nextConfig;
