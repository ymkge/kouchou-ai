import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, Heading, Image, Text } from "@chakra-ui/react";
import { CircleHelpIcon } from "lucide-react";

const isStaticExport = process.env.NEXT_PUBLIC_OUTPUT_MODE === "export";
const basePath = process.env.NEXT_PUBLIC_STATIC_EXPORT_BASE_PATH || "";
const siteUrl = process.env.NEXT_PUBLIC_STATIC_EXPORT_SITE_URL ?? "";
const defaultHost = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const host = isStaticExport
  ? (siteUrl || defaultHost)
  : defaultHost;
const imageUrl = `${host}${isStaticExport ? basePath : ""}/images/broadlistening.png`;

export function BroadlisteningGuide() {
  return (
    <DialogRoot size="xl" placement="center" motionPreset="slide-in-bottom">
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <CircleHelpIcon />
          <Text display={{ base: "none", lg: "block" }}>
            ブロードリスニングの解説
          </Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <Heading as={"h2"} size={"xl"} className={"headingColor"}>
            ブロードリスニングとは？
          </Heading>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Text mb={4} fontSize={"md"}>
            ブロードリスニングとは
            <b>「広く声を収集し、収集した声をAI技術で分析・可視化する手法」</b>
            です。
          </Text>
          <Image
            mb={4}
            src={imageUrl}
            alt={"ブロードリスニングのイメージ"}
          />
          <Text>
            かつてラジオやテレビなど放送技術の発展により、大勢の人に声を届けることが可能になりました。しかし大勢の声を聞くことはできませんでした。2023年ごろから、大規模言語モデルの技術の発展により、大勢の意見を要約し、わかりやすく可視化したりレポートにまとめたりすることが可能になりました。この「大勢の声を聞く技術」のことをブロードリスニングと言います。
          </Text>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
