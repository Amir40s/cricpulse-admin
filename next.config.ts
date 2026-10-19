import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production-stable Next.js configuration
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
