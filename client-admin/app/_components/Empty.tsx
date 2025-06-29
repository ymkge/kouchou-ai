import { Box, Button, Image, Link, Text, VStack } from "@chakra-ui/react";

export function Empty() {
  return (
    <VStack mt={8} gap={0} lineHeight={2}>
      <Text fontSize="18px" fontWeight="bold">
        レポートが0件です
      </Text>
      <Text fontSize="14px" textAlign={{ md: "center" }} mt={5}>
        レポートが作成されるとここに一覧が表示され、
        <Box as="br" display={{ base: "none", md: "block" }} />
        公開やダウンロードなどの操作が行えるようになります。
      </Text>
      <Text fontSize="12px" color="gray.500" mt={3}>
        レポート作成が開始済みの場合は、AI分析が完了するまでしばらくお待ちください。
      </Text>
      <Image src="images/report-empty.png" mt={8} />
      <Box mt={8}>
        <Link href="/create">
          <Button size="xl">新しいレポートを作成する</Button>
        </Link>
      </Box>
    </VStack>
  );
}
