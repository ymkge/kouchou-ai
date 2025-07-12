"use server";

import { getApiBaseUrl } from "../../../utils/api";

export async function csvDownloadForWindows(slug: string) {
  const response = await fetch(`${getApiBaseUrl()}/admin/comments/${slug}/csv`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "CSV ダウンロードに失敗しました");
  }

  const blob = await response.blob();
  const text = await blob.text();

  // UTF-8 BOMを追加
  const bom = "\uFEFF";
  const csvContent = bom + text;
  const buffer = Buffer.from(csvContent, "utf-8");

  return {
    data: buffer,
    filename: `kouchou_${slug}_excel.csv`,
    contentType: "text/csv;charset=utf-8",
  };
}
