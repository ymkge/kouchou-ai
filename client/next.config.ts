import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_OUTPUT_MODE === "export";
const SUB_DIRECTORY = process.env.SUB_DIRECTORY || "";

const nextConfig: NextConfig = {
  basePath: isStaticExport ? SUB_DIRECTORY : "",
  assetPrefix: isStaticExport ? SUB_DIRECTORY : "",
  publicRuntimeConfig: {
    basePath: isStaticExport ? SUB_DIRECTORY : "",
  },
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport ? true : undefined,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
