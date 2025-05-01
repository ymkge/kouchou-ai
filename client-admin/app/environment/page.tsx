"use client";

import { getApiBaseUrl } from "@/app/utils/api";
import { Header } from "@/components/Header";
import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CircleCheckIcon, CircleAlertIcon } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    use_azure: boolean;
  } | null>(null);

  const verifyChatGptApiKey = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/admin/environment/verify-chatgpt`,
        {
          method: "GET",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      console.error("Error verifying API key:", error);
      toaster.create({
        type: "error",
        title: "検証エラー",
        description: "API キーの検証中にエラーが発生しました",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container">
      <Header />
      <Box mx="auto" maxW="800px" mb={5}>
        <Heading textAlign="center" fontSize="xl" mb={5}>
          環境検証
        </Heading>

        <Card.Root p={5} mb={5}>
          <Card.Header>
            <Heading size="md">ChatGPT API キー検証</Heading>
          </Card.Header>
          <Card.Body>
            <Text mb={4}>
              ChatGPT API キーの設定を検証します。API キーが正しく設定されているか確認できます。
            </Text>
            <Text mb={4}>
              現在の設定: {process.env.NEXT_PUBLIC_USE_AZURE === "true" ? "Azure OpenAI Service" : "OpenAI API"}
            </Text>

            <Button
              onClick={verifyChatGptApiKey}
              isLoading={isVerifying}
              loadingText="検証中..."
              mb={4}
            >
              API キーを検証
            </Button>

            {verificationResult && (
              <Box
                mt={4}
                p={4}
                borderRadius="md"
                backgroundColor={
                  verificationResult.success ? "green.50" : "red.50"
                }
              >
                <HStack>
                  <Box color={verificationResult.success ? "green" : "red"}>
                    {verificationResult.success ? (
                      <CircleCheckIcon size={24} />
                    ) : (
                      <CircleAlertIcon size={24} />
                    )}
                  </Box>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="bold">
                      {verificationResult.success
                        ? "検証成功"
                        : "検証失敗"}
                    </Text>
                    <Text>{verificationResult.message}</Text>
                    <Text>
                      使用モード:{" "}
                      {verificationResult.use_azure
                        ? "Azure OpenAI Service"
                        : "OpenAI API"}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </Card.Body>
        </Card.Root>

        <Text fontSize="sm" color="gray.500" mt={8} textAlign="center">
          注意: API キーの検証は既存の環境設定を確認するだけで、設定自体は変更しません。
          設定を変更するには .env ファイルを直接編集してください。
        </Text>
      </Box>
    </div>
  );
}
