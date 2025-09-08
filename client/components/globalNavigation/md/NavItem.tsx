"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function NavItem({ href, label, icon }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Box
      p="3"
      borderBottom={isActive ? "2px solid" : "none"}
      h="auto"
      borderRadius="none"
      _hover={{
        color: !isActive ? "font.link" : "currentcolor",
      }}
    >
      <a href={href}>
        <VStack>
          {icon}
          <Text textStyle="body/sm">{label}</Text>
        </VStack>
      </a>
    </Box>
  );
}
