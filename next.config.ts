import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep canonical, robots and preview images in the initial HTML head for every visitor.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
