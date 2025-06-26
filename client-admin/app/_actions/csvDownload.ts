import { getApiBaseUrl } from "../utils/api";

export async function csvDownload(slug: string) {
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
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kouchou_${slug}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
}
