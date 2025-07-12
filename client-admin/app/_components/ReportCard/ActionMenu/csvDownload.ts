"use server";

import { getApiBaseUrl } from "../../../utils/api";

export async function csvDownload(slug: string) {
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
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    data: buffer.toString("base64"),
    filename: `kouchou_${slug}.csv`,
    contentType: "text/csv",
  };
}
