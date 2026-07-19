import type { NextConfig } from "next";

/** Next.js application configuration. */
const nextConfig: NextConfig = {
  turbopack: {
    // Keep module resolution scoped to this app when parent directories contain lockfiles.
    root: process.cwd(),
  },
};

export default nextConfig;
