import type { Meta } from "@/type";
import { Box, Button as _Button, Flex, HStack, Heading, Stack, Text, Link } from "@chakra-ui/react";
import { ArrowUpRight, ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "./ui/dialog";
import Image from "next/image";

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
            <Button variant="outline" size="md" rounded="full" fontWeight="bold" color="gray.800" borderColor="gray.300">
              閉じる
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

const Button = ({ children, ...props}) => { 
  return (
    <_Button variant="outline" rounded="full" size="xs" fontWeight="bold" px="5" borderColor="gray.800" {...props}>
      {children}
    </_Button>
  );
}

export function Footer({ meta }: Props) {
  return (
    <Box as="footer" fontSize="xs" color="gray.800" lineHeight="2">
      <Box bg="url('/images/footer-bg.webp')" bgSize="cover" bgPos="center" py={{ base: "6", md: "10" }} px={{ base: "6", md: "12" }}>
        <Flex bg="white" py="8" px="8" borderRadius="3xl" maxW="1024px" mx="auto" flexDirection={{ base: "column", lg: "row" }} alignItems={{ base: "center", lg: "flex-end" }} gap="8">
          <Image src="/images/kouchouai-logo.svg" alt="広聴AI すべての声が社会を動かす力になる。" width={256} height={102} />
          <Flex flexDirection="column" gap={{ base: "4"}}>
            <Text>
              広聴AIは、デジタル民主主義2030プロジェクトから生まれたオープンソース（OSS）アプリケーションです。
              <Box as="br" display={{ base: "none", lg: "inline" }} />
              本ページは、そのOSS成果物を活用して構築されています。
            </Text>
            <Flex gap="3">
              <Button asChild>
                <a href="https://dd2030.org/kouchou-ai" target="_blank" rel="noopener noreferrer">
                  広聴AIについて
                  <ArrowUpRight />
                </a>
              </Button>
              <Dialog
                title="謝辞"
                trigger={
                  <Button>謝辞</Button>
                }
              >
                このプロジェクトは{" "}
                <Link
                  href="https://ai.objectives.institute/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AI Objectives Institute
                </Link>{" "}
                開発した{" "}
                <Link
                  href="https://github.com/AIObjectives/talk-to-the-city-reports"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Talk to the City
                </Link>{" "}
                を参考に開発されています。ライセンスに基づいてソースコードを一部活用し、機能追加や改善を実施しています。
              </Dialog>
            </Flex>
          </Flex>
        </Flex>
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
                <Button variant="plain" border="none">免責</Button>
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
