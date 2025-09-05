"use client";

import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { CircleHelp, Files } from "lucide-react";
import { usePathname } from "next/navigation";

export function GlobalNavigation() {
  const pathname = usePathname();

  return (
    <HStack gap="4">
      <Button variant="plain" p="0" asChild>
        <a href="/">
          <VStack>
            <Files />
            <Text textStyle="body/sm">レポート一覧</Text>
          </VStack>
        </a>
      </Button>
      <Button variant="plain" p="0" asChild>
        <a href="/faq">
          <VStack>
            <CircleHelp />
            <Text textStyle="body/sm">よくあるご質問</Text>
          </VStack>
        </a>
      </Button>
    </HStack>
  )
}
