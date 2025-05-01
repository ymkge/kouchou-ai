/**
 * 静的エクスポート時のベースURLを取得する
 * @returns ベースURL (例: "https://example.com/path")
 */
export const getBaseUrl = (): string => {
  const isStaticExport = process.env.NEXT_PUBLIC_OUTPUT_MODE === "export";
  const basePath = process.env.NEXT_PUBLIC_STATIC_EXPORT_BASE_PATH || "";
  const siteUrl = process.env.NEXT_PUBLIC_STATIC_EXPORT_SITE_URL ?? "";
  const defaultHost = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const host = isStaticExport
    ? (siteUrl || defaultHost)
    : defaultHost;
  
  return host + (isStaticExport ? basePath : "");
};

/**
 * 相対パスから絶対URLを生成する
 * @param path 相対パス (例: "/images/example.png")
 * @returns 絶対URL (例: "https://example.com/path/images/example.png")
 */
export const getAbsoluteUrl = (path: string): string => {
  return `${getBaseUrl()}${path}`;
};

/**
 * サーバーから画像のURLを取得する
 * @param src 画像のパス
 * @returns 画像の絶対URL
 */
export const getImageFromServerSrc = (src: string) => {
  if (process.env.NEXT_PUBLIC_OUTPUT_MODE === "export" && src) {
    const staticExportBasePath = process.env.NEXT_PUBLIC_STATIC_EXPORT_BASE_PATH || "";
    return staticExportBasePath + src;
  }

  const basePath = process.env.NEXT_PUBLIC_API_BASEPATH;
  return new URL(src, basePath).href;
};