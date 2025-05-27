"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import type { Meta } from "@/type";
import { Box, Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { Globe } from "lucide-react";
import { useState } from "react";

function MessageText({ message }: { message: string }) {
  const [isShow, setIsShow] = useState(false);

  return (
    <Box position="relative">
      <Text
        as="div"
        fontSize="sm"
        lineHeight={2}
        lineClamp={isShow ? undefined : 2}
        whiteSpace={isShow ? "pre-line" : "normal"}
        color="gray.600"
      >
        {message}
        {!isShow && (
          <Flex position="absolute" right="0" bottom="0" zIndex="1" bg="white">
            <Text w="1rem">...</Text>
            <Link
              variant="underline"
              color="currentcolor"
              textDecorationColor="currentcolor"
              onClick={() => setIsShow(true)}
            >
              全文表示
            </Link>
          </Flex>
        )}
      </Text>
    </Box>
  );
}

export function Reporter({ meta }: { meta?: Meta }) {
  return (
    <div className="reporter">
      <Flex flexDirection="column" gap="4" color="gray.600">
        <Flex gap="4" flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "flex-start", md: "center" }}>
          <Image w="150px" src={getImageFromServerSrc("/meta/reporter.png")} alt="" />
          <Flex flexDirection="column" justifyContent="space-between" color="gray.600">
            <Text fontSize="xs">レポーター</Text>
            <Text fontSize="md" fontWeight="bold">
              {meta?.reporter}
            </Text>
          </Flex>
        </Flex>
        {meta?.message && <MessageText message={meta.message} />}
        <Flex gap="3" flexWrap="wrap">
          {meta?.webLink && (
            <Button
              variant="outline"
              size="md"
              fontSize="xs"
              color="currentcolor"
              _icon={{
                width: "14px",
                height: "14px",
              }}
            >
              <a href={meta.webLink} target="_blank" rel="noopener noreferrer">
                <Flex gap="1" alignItems="center">
                  <Globe />
                  ウェブサイト
                </Flex>
              </a>
            </Button>
          )}
          {meta?.privacyLink && (
            <Button variant="outline" size="md" fontSize="xs" color="currentcolor">
              <a href={meta.privacyLink} target="_blank" rel="noopener noreferrer">
                プライバシーポリシー
              </a>
            </Button>
          )}
          {meta?.termsLink && (
            <Button variant="outline" size="md" fontSize="xs" color="currentcolor">
              <a href={meta.termsLink} target="_blank" rel="noopener noreferrer">
                利用規約
              </a>
            </Button>
          )}
        </Flex>
      </Flex>
    </div>
  );
}
