"use client";

import { useState } from "react";

export function useBuildDownload() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload(slugs: string[] = [""]) {
    setIsLoading(true);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        body: JSON.stringify({ slugs: slugs.join(",") }),
      });

      if (!res.ok) {
        throw new Error("ビルドに失敗しました");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const match = contentDisposition?.match(/filename="?(.+)"?/);
      const filename = match?.[1] ?? "kouchou-ai.zip";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`ダウンロードに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    handleDownload,
  };
}
