"use client";

import { BroadlisteningGuide } from "@/components/report/BroadlisteningGuide";
import { HStack, Image, useBreakpointValue } from "@chakra-ui/react";

export function Header() {
  const logoSrc = useBreakpointValue({
    base: "/images/logo-sp.svg",
    md: "/images/logo.svg",
  });

  return (
    <HStack className="container" p="6" justifyContent="space-between" bg="white">
      <Image src={logoSrc} alt="広聴AI" />
      <BroadlisteningGuide />
    </HStack>
  );
}
