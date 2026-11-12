import type { NextConfig } from "next";
import imageSizes from "./src/lib/image-sizes.json";

const nextConfig: NextConfig = {
  // The site is fully static: `next build` writes plain HTML/CSS/JS to `out/`,
  // which Cloudflare Pages serves straight from its CDN.
  output: "export",
  allowedDevOrigins: ["127.0.0.1", "192.168.1.18"],
  poweredByHeader: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: imageSizes.deviceSizes,
    imageSizes: imageSizes.imageSizes,
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
