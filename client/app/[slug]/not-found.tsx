import { Button } from "@chakra-ui/react";
import getConfig from "next/config";
import Link from "next/link";

export default function NotFound() {
  const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };
  const basePath = publicRuntimeConfig.basePath || "";

  return (
    <>
      <p>ページが見つかりませんでした</p>
      <Link href={`${basePath}/`}>
        <Button>トップに戻る</Button>
      </Link>
    </>
  );
}
