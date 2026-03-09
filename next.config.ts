import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.mydscvr.ai",
      },
    ],
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
