"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import { BroadlisteningGuide } from "@/components/report/BroadlisteningGuide";
import { HStack, Image, useBreakpointValue } from "@chakra-ui/react";

export function Header() {
  const logoSrc = useBreakpointValue({
    base: getImageFromServerSrc("/images/logo-sp.svg"),
    md: getImageFromServerSrc("/images/logo.svg")
  });

  return (
    <HStack justify="space-between" py="5" mb={8} mx={"auto"} maxW={"1200px"}>
      <Image
        src={logoSrc}
        alt="広聴AI"
      />
      <BroadlisteningGuide />
    </HStack>
  );
}
