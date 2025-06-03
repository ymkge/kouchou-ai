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
    <Box as="footer" lineHeight="2">
      <Box bg="url('/images/footer-bg.webp')" bgSize="cover" bgPos="center" py={{ base: "6", md: "10" }} px={{ base: "6", md: "12" }}>
        <Box bg="white" py="8" px="8" borderRadius="3xl" maxW="1024px" mx="auto">
          広聴AI
        </Box>
      </Box>
      <Box bg="#F1F6F8" py={{ base: "6", md: "10" }} px={{ base: "6", md: "12" }} mx="auto">
        <Box bg="white" py="8" px="8" borderRadius="3xl" maxW="1024px" mx="auto">
          デジタル民主主義
        </Box>
      </Box>
      <Box bg="white" py={{ base: "6", lg: "4" }} px={{ base: "6", md: "12" }} textAlign="center">
        <Flex maxW="1024px" mx="auto" justifyContent={{ lg: "space-between"}} alignItems={{ base: "center" }} flexDirection={{ base: "column-reverse", lg: "row" }} gap={{ base: "4" }}>
          <Text display="flex" color="gray.500" fontSize="xs">
            © 2025 デジタル民主主義2030
            <Box as="span" mx="0.4em" display={{ base: "none", lg: "inline" }}>|</Box>
            <Box as="br" display={{ base: "inline", lg: "none" }} />
            レポート内容はレポーターに帰属します
          </Text>
          <Flex gap="6" alignItems="center" color="gray.800">
            {meta.termsLink && (
              <Link href={meta.termsLink}>
                <Text fontWeight="bold" fontSize="xs">利用規約</Text>
              </Link>
            )}
            <Button variant="plain" fontWeight="bold" size="xs">免責</Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
