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
    available_models: string[];
    error_type?: string;
    balance_info?: {
      total_available: number;
      grants: Array<{
        grant_amount: number;
        used_amount: number;
        expires_at: number;
      }>;
    };
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
              loading={isVerifying}
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
                  <VStack align="flex-start">
                    <Text fontWeight="bold" mb={1}>
                      {verificationResult.success
                        ? "検証成功"
                        : "検証失敗"}
                    </Text>
                    <Text mb={1}>{verificationResult.message}</Text>
                    {verificationResult.error_type === "insufficient_quota" && (
                      <Text mb={1} color="orange.600" fontWeight="bold">
                        デポジット残高不足: APIキーのデポジット残高が不足しています。残高を追加してください。
                      </Text>
                    )}
                    
                    {!verificationResult.use_azure && verificationResult.balance_info && (
                      <Box mt={2} mb={2} p={3} borderWidth="1px" borderRadius="md" backgroundColor="blue.50">
                        <Text fontWeight="bold" mb={1}>アカウント残高情報:</Text>
                        <Text>利用可能な残高: ${verificationResult.balance_info.total_available.toFixed(2)}</Text>
                        {verificationResult.balance_info.grants && verificationResult.balance_info.grants.length > 0 && (
                          <Box mt={2}>
                            <Text fontWeight="bold" fontSize="sm">クレジット詳細:</Text>
                            {verificationResult.balance_info.grants.map((grant, index) => (
                              <Box key={index} mt={1} fontSize="sm">
                                <Text>付与額: ${grant.grant_amount.toFixed(2)}</Text>
                                <Text>使用額: ${grant.used_amount.toFixed(2)}</Text>
                                <Text>有効期限: {new Date(grant.expires_at * 1000).toLocaleDateString()}</Text>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                    <Text mb={1}>
                      使用モード:{" "}
                      {verificationResult.use_azure
                        ? "Azure OpenAI Service"
                        : "OpenAI API"}
                    </Text>
                    {verificationResult.success && verificationResult.available_models && verificationResult.available_models.length > 0 && (
                      <Box mt={2}>
                        <Text fontWeight="bold" mb={1}>利用可能なモデル:</Text>
                        <Box 
                          maxH="200px" 
                          overflowY="auto" 
                          p={2} 
                          borderWidth="1px" 
                          borderRadius="md"
                        >
                          {verificationResult.available_models.map((model: string, index: number) => (
                            <Text key={index} fontSize="sm">{model}</Text>
                          ))}
                        </Box>
                      </Box>
                    )}
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
