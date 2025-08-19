"use client";

import { BroadlisteningGuide } from "@/components/report/BroadlisteningGuide";
import { HStack, Image } from "@chakra-ui/react";

export function Header() {
  return (
    <HStack justify="space-between" py="5" mb={8} mx={"auto"} maxW={"1200px"}>
      <Image src="/images/logo.svg" alt="広聴AI" />
      <BroadlisteningGuide />
    </HStack>
  );
}
