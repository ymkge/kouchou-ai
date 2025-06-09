import type { Meta } from "@/type";
import { Image } from "@chakra-ui/react";
import { ReporterContent } from "./ReporterContent";

async function ReporterImage({
  reporterName,
}: {
  reporterName: string;
}) {
  const imagePath = "/meta/reporter.png";
  try {
    // リポータ画像の有無はserver側で確認する
    const url = new URL(imagePath, process.env.API_BASEPATH).toString();
    const res = await fetch(url);

    if (res.status === 200) {
      // 画像が存在する場合は、clientから取得できる画像のパスを返す
      const src = new URL(imagePath, process.env.NEXT_PUBLIC_API_BASEPATH).toString();
      return <Image src={src} alt={reporterName} maxW="150px" />;
    }
  } catch (error) {
    console.error("Failed to fetch reporter image:", error);
  }

  return null;
}

export async function Reporter({ meta }: { meta: Meta }) {
  return (
    <ReporterContent meta={meta}>
      <ReporterImage reporterName={meta.reporter || ""} />
    </ReporterContent>
  );
}
