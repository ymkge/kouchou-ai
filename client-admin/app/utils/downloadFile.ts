type DownloadFileData = {
  data: Buffer | Uint8Array;
  filename: string;
  contentType: string;
};

export function downloadFile({ data, filename, contentType }: DownloadFileData) {
  const blob = new Blob([data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}