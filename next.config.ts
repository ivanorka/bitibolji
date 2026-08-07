import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Cloudflare worker and D1 sources are built by vinext. Netlify runs the
  // standard Next.js compiler, so keep its type-checking scoped to the web app.
  typescript: {
    tsconfigPath: "./tsconfig.netlify.json",
  },
};

export default nextConfig;
