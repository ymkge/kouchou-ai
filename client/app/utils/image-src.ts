/**
 * 静的エクスポート時のベースパスを取得する
 * @returns ベースパス (例: "/path" または "")
 */
export const getBasePath = (): string => {
  const isStaticExport = process.env.NEXT_PUBLIC_OUTPUT_MODE === "export";
  const basePath = process.env.NEXT_PUBLIC_STATIC_EXPORT_BASE_PATH || "";
  
  return isStaticExport ? basePath : "";
};

/**
 * パスを生成する
 * @param path パス (例: "/images/example.png")
 * @returns basePath付きのパス (例: "/path/images/example.png")
 */
export const getRelativeUrl = (path: string): string => {
  const basePath = getBasePath();
  
  // パスが / で始まることを確認し、先頭の / を除去
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // basePathとパスを結合
  return `${basePath}/${cleanPath}`;
};

/**
 * サーバーから画像のURLを取得する
 * @param src 画像のパス
 * @returns 画像のパス
 */
export const getImageFromServerSrc = (src: string) => {
  if (!src) return '';
  
  try {
    // 絶対URLの場合はそのまま返す
    new URL(src);
    return src;
  } catch {
    // 相対パスの場合
    if (process.env.NEXT_PUBLIC_OUTPUT_MODE === "export") {
      const basePath = getBasePath();
      
      // パスが / で始まる場合は除去
      const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
      
      // basePathとパスを結合
      return `${basePath}/${cleanSrc}`;
    }

    // 開発環境やサーバーサイドレンダリング時
    const basePath = process.env.NEXT_PUBLIC_API_BASEPATH || '';
    return `${basePath}${src}`;
  }
};