import { Button } from "@/components/ui/button";
import { Box, HStack, Heading, Image, Text, VStack } from "@chakra-ui/react";
import { ArrowUpRight } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Heading textStyle="heading/2xl" pt="12" pb="6">
        お問い合わせ
      </Heading>
      <Box
        padding="4px"
        bg="linear-gradient(241.3deg, #FDC7FD 17.69%, #ACFBFF 50.31%, #D9E0FF 82.31%)"
        borderRadius="2xl"
      >
        <Box bg="white" borderRadius="12px" p="8">
          <HStack gap="8">
            <Image w="45%" src="/images/contact-hello.webp" alt="" />
            <VStack alignItems="flex-start" gap="4">
              <Text textStyle="body/md">
                このページで解決できなかった内容や、その他のご質問がございましたら、
                デジタル民主主義2030のslackコミュニティのチャンネル「#6_ホストユーザー相談」でお気軽にお声がけください。チーム一同、迅速にサポートいたします。
              </Text>
              <Button variant="secondary" size="md" asChild>
                <a href="https://dd2030.slack.com" target="_blank" rel="noopener noreferrer">
                  slackコミュニティで質問する
                  <ArrowUpRight />
                </a>
              </Button>
            </VStack>
          </HStack>
        </Box>
      </Box>
    </>
  );
}
