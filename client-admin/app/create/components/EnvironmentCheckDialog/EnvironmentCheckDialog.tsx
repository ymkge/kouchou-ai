import { Button } from "@/components/ui/button";
import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Box, Image, Text } from "@chakra-ui/react";
import { SquareArrowOutUpRight } from "lucide-react";

export const EnvironmentCheckDialog = () => {
  return (
    <DialogRoot size="sm">
      <DialogBackdrop
        zIndex={1000}
        position="fixed"
        inset={0}
        backgroundColor="blackAlpha.100"
        backdropFilter="blur(2px)"
      />
      <DialogTrigger asChild>
        <Button variant="ghost">
          API接続チェック <SquareArrowOutUpRight />
        </Button>
      </DialogTrigger>

      <DialogContent
        color="font.primary"
        bg="linear-gradient(216.39deg, #FCFFDB -0.01%, #F0FDF4 24.99%, #ECFEFF 35%, #FFFFFF 50%);"
      >
        <DialogHeader justifyContent="center" pb="0">
          <DialogTitle textStyle="body/lg/bold">API接続チェック</DialogTitle>
        </DialogHeader>
        <DialogBody
          pt="3"
          px="8"
          pb="8"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          textAlign="center"
        >
          <Text textStyle="body/md">APIキー設定とデポジット残高を確認します。</Text>
          <Image src="/images/check-api-img.svg" alt="" mt="6" />
          <Text textStyle="body/sm" textAlign="left" mt="6">
            接続チェックにはAPIを使用します。有料のAIプロバイダーの場合は1回あたり約0.005円のAPI利用料がかかります。
          </Text>
          <Text textStyle="body/sm" color="font.secondary" mt="4">
            ボタン押下をもって上記に同意とみなします。
          </Text>
          <Box mt="4">
            <Button size="md">チェックする</Button>
          </Box>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
