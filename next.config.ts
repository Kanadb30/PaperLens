import type { NextConfig } from "next";

if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY must NOT be prefixed with NEXT_PUBLIC_');
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
