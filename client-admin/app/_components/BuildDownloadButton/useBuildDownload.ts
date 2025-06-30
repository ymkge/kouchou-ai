"use client";

import { toaster } from "@/components/ui/toaster";
import { useState } from "react";

export function useBuildDownload() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload() {
    setIsLoading(true);

    try {
      const res = await fetch("/api/download");

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

      toaster.create({
        type: "success",
        duration: 5000,
        title: "エクスポート完了",
        description: "ダウンロードフォルダに保存されました。",
      });
    } catch (error) {
      toaster.create({
        type: "error",
        duration: 5000,
        title: "エクスポート失敗",
        description: "問題が解決しない場合は、管理者に問い合わせてください。",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    handleDownload,
  };
}
