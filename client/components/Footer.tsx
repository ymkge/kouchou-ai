import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { Meta } from "@/type";
import { Box, Button, Flex, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  meta: Meta;
};

export function Footer({ meta }: Props) {
  return (
    <Box as="footer">
      <Box bg="url('/images/footer-bg.webp')" bgSize="cover" bgPos="center" py={{ base: "6", md: "12" }} px={{ base: "6", md: "12" }}>
        <Box bg="white" py="8" px="8" borderRadius="3xl" maxW="1024px" mx="auto">
          広聴AI
        </Box>
      </Box>
      <Box bg="#F1F6F8" py={{ base: "6", md: "12" }} px={{ base: "6", md: "12" }} mx="auto">
        <Box bg="white" py="8" px="8" borderRadius="3xl" maxW="1024px" mx="auto">
          デジタル民主主義
        </Box>
      </Box>
      <Box bg="white" py={{ base: "6", md: "4" }}  textAlign={{ base: "center", md: "left" }}>
        <Flex maxW="1024px" mx="auto" justifyContent="space-between">
          <Text display="flex" color="gray.500" fontSize="xs">
            © 2025 デジタル民主主義2030
            <Box as="span" mx="0.4em">|</Box>
            レポート内容はレポーターに帰属します
          </Text>
          <Flex gap="2" fontSize="xs">
            {meta.termsLink && (
              <Link href={meta.termsLink}>利用規約</Link>
            )}
            <Text>免責</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
