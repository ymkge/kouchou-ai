import type { Meta } from "@/type";
import { Box, Button, Flex, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "./ui/dialog";

type Props = {
  meta: Meta;
};

const Dialog = ({ title, trigger, children }: { title: string; trigger: ReactNode; children: ReactNode }) => {
  return (
    <DialogRoot size="sm">
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent
        color="gray.800"
        bg="linear-gradient(216.39deg, #FCFFDB -0.01%, #F0FDF4 24.99%, #ECFEFF 35%, #FFFFFF 50%);
"
      >
        <DialogHeader pt={{ base: "6", md: "8" }} justifyContent="center">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody px={{ base: "6", md: "8" }}>
          <Text fontSize="sm" lineHeight="2">
            {children}
           </Text>
        </DialogBody>
        <DialogCloseTrigger />
        <DialogFooter pb={{ base: "6", md: "8" }} justifyContent="center">
          <DialogActionTrigger asChild>
            <Button variant="outline" size="md" rounded="full" fontWeight="bold" color="gray.800">
              閉じる
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
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
            <Dialog
              title="免責"
              trigger={
                <Button variant="plain" fontWeight="bold" size="xs">免責</Button>
              }
             >
              このレポート内容に関する質問や意見はレポート発行責任者へお問い合わせください。
              <br />
              大規模言語モデル（LLM）にはバイアスがあり、信頼性の低い結果を生成することが知られています。私たちはこれらの問題を軽減する方法に積極的に取り組んでいますが、現段階ではいかなる保証も提供することはできません。特に重要な決定を下す際は、本アプリの出力結果のみに依存せず、必ず内容を検証してください。
             </Dialog>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
