export const getImageFromServerSrc = (src: string) => {
  if (process.env.NEXT_PUBLIC_OUTPUT_MODE === "export" && src) {
    const staticExportBasePath = process.env.NEXT_PUBLIC_STATIC_EXPORT_BASE_PATH || "";
    return staticExportBasePath + src;
  }

  const basePath = process.env.NEXT_PUBLIC_API_BASEPATH;
  return new URL(src, basePath).href;
};