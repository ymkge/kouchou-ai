import { Button } from "@chakra-ui/react";
import { useBuildDownload } from "./useBuildDownload";

export const BuildDownloadButton = () => {
  const { isLoading, handleDownload } = useBuildDownload();

  return (
    <Button size="xl" onClick={handleDownload} loading={isLoading} loadingText="エクスポート中">
      全レポートをエクスポート
    </Button>
  );
};
