import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA(nextConfig);