import getConfig from "next/config";

export const getImageFromServerSrc = (src: string): string => {
  if (!src) {
    return ""; // src が空の場合は空文字を返す
  }

  // 絶対URLの場合はそのまま返す
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
    return src;
  }

  if (process.env.NEXT_PUBLIC_OUTPUT_MODE === "export") {
    const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };
    const basePath = publicRuntimeConfig.basePath || "";

    // URL オブジェクトを使って basePath と src を安全に結合するのだ
    // new URL(relativePath, base) の形式を使う
    // base はダミーのオリジンを含む必要があるのだ (例: http://dummy)
    // basePath が空文字列の場合は "/" を使うのだ
    const dummyOrigin = "http://dummy";
    const effectiveBasePath = basePath || "/";
    // basePath が "/" で終わっていない場合は追加するのだ
    const baseWithTrailingSlash = effectiveBasePath.endsWith('/') ? effectiveBasePath : `${effectiveBasePath}/`;
    // src が "/" で始まっている場合は削除するのだ
    const relativeSrc = src.startsWith('/') ? src.substring(1) : src;

    try {
      // ダミーオリジンと結合したベースURLに対して、相対パスの src を解決するのだ
      const resolvedUrl = new URL(relativeSrc, `${dummyOrigin}${baseWithTrailingSlash}`);
      // pathname を返すことで、ドメイン部分を除いたパスが得られるのだ
      return resolvedUrl.pathname;
    } catch (e) {
       console.error(`Failed to resolve image path with basePath. src: ${src}, basePath: ${basePath}`, e);
       // エラー時はルート相対パスとして返すのだ
       return src.startsWith('/') ? src : `/${src}`;
    }

  } else {
    const apiBasePath = process.env.NEXT_PUBLIC_API_BASEPATH;
    if (!apiBasePath) {
      console.warn("NEXT_PUBLIC_API_BASEPATH is not defined. Using relative path.");
      // APIベースパスがない場合もルート相対パスとして返すのだ
      return src.startsWith('/') ? src : `/${src}`;
    }

    try {
      // APIベースパスに対して src を解決するのだ
      return new URL(src, apiBasePath).href;
    } catch (e) {
      console.error(`Failed to create URL for src: ${src} with base: ${apiBasePath}`, e);
      // エラー時はルート相対パスとして返すのだ
      return src.startsWith('/') ? src : `/${src}`;
    }
  }
};
