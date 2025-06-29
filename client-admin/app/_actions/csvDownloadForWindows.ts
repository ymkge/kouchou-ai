import { getApiBaseUrl } from "../utils/api";

export async function csvDownloadForWindows(slug: string) {
  try {
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
    const bomBlob = new Blob([bom + text], {
      type: "text/csv;charset=utf-8",
    });
    const url = window.URL.createObjectURL(bomBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kouchou_${slug}_excel.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
}
