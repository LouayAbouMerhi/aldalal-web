import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets you open the dev server from a phone on the same Wi-Fi (http://192.168.x.x:3000).
  // Without this, Next.js blocks the dev assets and the page loads without its JavaScript.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  // `npm run build:static` writes a plain static site to /out (Firebase Hosting, Netlify, cPanel…)
  output: process.env.STATIC_EXPORT === "1" ? "export" : undefined,
  images: {
    // Product photos are already resized to WebP by `npm run import`,
    // so they are served as-is (works on any host, including static export).
    unoptimized: true,
  },
};

export default nextConfig;
