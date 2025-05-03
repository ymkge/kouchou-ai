"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import { BroadlisteningGuide } from "@/components/report/BroadlisteningGuide";
import type { Meta } from "@/type";
import { HStack, Image } from "@chakra-ui/react";

type Props = {
  meta: Meta | null;
};

export function Header({ meta }: Props) {
  // metaが存在し、かつカスタムの場合は画像を表示
  if (!meta || meta.is_default) {
    return null;
  }

  return (
    <HStack justify="space-between" mb={8} mx={"auto"} maxW={"1200px"}>
      <HStack>
        <Image
          src={getImageFromServerSrc("/meta/reporter.png")}
          mx={"auto"}
          objectFit={"cover"}
          maxH={{ base: "40px", md: "60px" }}
          maxW={{ base: "120px", md: "200px" }}
          alt={meta.reporter}
        />
      </HStack>
      <BroadlisteningGuide />
    </HStack>
  );
}
