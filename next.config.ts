import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // static export — no server-side optimization
  },
  // output: "export", // enable for Netlify deploy; disabled for dev
};

export default nextConfig;
