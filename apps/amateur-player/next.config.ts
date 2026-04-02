import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@bowlersnetwork/ui",
    "@bowlersnetwork/auth",
    "@bowlersnetwork/api-client",
    "@bowlersnetwork/utils",
    "@bowlersnetwork/types",
    "@bowlersnetwork/validators",
  ],
};

export default nextConfig;
