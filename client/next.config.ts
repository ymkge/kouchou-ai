import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_OUTPUT_MODE === "export";
const BASE_PATH = process.env.STATIC_EXPORT_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: isStaticExport ? BASE_PATH : "",
  assetPrefix: isStaticExport ? BASE_PATH + "/" : "",
  publicRuntimeConfig: {
    basePath: isStaticExport ? BASE_PATH : "",
  },
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport ? true : undefined,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
