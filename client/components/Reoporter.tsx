"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import type { Meta } from "@/type";
import { Box, Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

function ReporterImage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);
  const src = getImageFromServerSrc("/meta/reporter.png");

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      // 画像がすでに読み込まれているかどうかをチェック
      if (img.naturalWidth === 0) {
        setStatus("error");
      } else {
        setStatus("success");
      }
    }
  }, [src]);

  return (
    <Image
      ref={imgRef}
      src={src}
      alt=""
      onLoad={() => setStatus("success")}
      onError={() => setStatus("error")}
      w="150px"
      display={status === "success" ? "inline-block" : "none"}
      mb={{ base: "4", md: "0" }}
      mr={{ base: "0", md: "4" }}
    />
  );
}

export function Reporter({ meta }: { meta?: Meta }) {
  return (
    <div className="reporter">
      <Flex flexDirection="column" gap="4" color="gray.600">
        <Flex flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "flex-start", md: "center" }}>
          <ReporterImage />
          <Flex flexDirection="column" justifyContent="space-between" color="gray.600">
            <Text fontSize="xs">レポーター</Text>
            <Text fontSize="md" fontWeight="bold">
              {meta?.reporter}
            </Text>
          </Flex>
        </Flex>
        {meta?.message && <MessageText message={meta.message} />}
        <Flex gap="3" flexWrap="wrap">
          {!meta?.isDefault && meta?.webLink && (
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
          {!meta?.isDefault && meta?.privacyLink && (
            <Button variant="outline" size="md" fontSize="xs" color="currentcolor">
              <a href={meta.privacyLink} target="_blank" rel="noopener noreferrer">
                プライバシーポリシー
              </a>
            </Button>
          )}
          {!meta?.isDefault && meta?.termsLink && (
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
