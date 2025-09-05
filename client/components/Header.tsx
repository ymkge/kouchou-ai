"use client";

import { HStack, Image, useBreakpointValue } from "@chakra-ui/react";
import { GlobalNavigation } from "./GlobalNavigation";

export function Header() {
  const logoSrc = useBreakpointValue({
    base: "/images/logo-sp.svg",
    md: "/images/logo.svg",
  });

  return (
    <HStack className="container" p="6" justifyContent="space-between" bg="white">
      <Image src={logoSrc} alt="広聴AI" />
      <GlobalNavigation />
    </HStack>
  );
}
