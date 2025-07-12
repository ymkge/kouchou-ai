"use server";

import { getApiBaseUrl } from "../../../utils/api";

type CsvDownloadOptions = {
  includeBOM?: boolean;
  filenameSuffix?: string;
  contentType?: string;
};

export async function csvDownloadCommon(slug: string, options: CsvDownloadOptions = {}) {
  const { includeBOM = false, filenameSuffix = "", contentType = "text/csv" } = options;

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

  if (!includeBOM) {
    const arrayBuffer = await blob.arrayBuffer();
    const csvContent = Buffer.from(arrayBuffer).toString("base64");
    return {
      data: csvContent,
      filename: `kouchou_${slug}${filenameSuffix}.csv`,
      contentType,
    };
  }

  const text = await blob.text();
  const bom = "\uFEFF";
  const csvContent = bom + text;
  const buffer = Buffer.from(csvContent, "utf-8");

  return {
    data: buffer.toString("base64"),
    filename: `kouchou_${slug}${filenameSuffix}.csv`,
    contentType,
  };
}
