"use client";

import { BroadlisteningGuide } from "@/components/report/BroadlisteningGuide";
import { HStack, Image, useBreakpointValue } from "@chakra-ui/react";

export function Header() {
  const logoSrc = useBreakpointValue({
    base: "/images/logo-sp.svg",
    md: "/images/logo.svg"
  });

  return (
    <HStack w="100%" p="6">
      <HStack className={"container"} py="0" justifyContent="space-between" maxW="1200px" mx="auto" bg="white">
        <Image
          src={logoSrc}
          alt="広聴AI"
        />
        <BroadlisteningGuide />
     </HStack>
    </HStack>
  );
}
