"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import type { Meta } from "@/type";
import { Box, Button, Flex, Image, Link, Skeleton, SkeletonText, Text } from "@chakra-ui/react";
import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function MessageText({ message }: { message: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(true);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      const isOverflowing = el.scrollHeight > el.clientHeight + 1; // 多少の誤差を考慮
      setIsTruncated(isOverflowing);
    };

    checkOverflow();
    setIsCalculating(false);

    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return (
    <Box>
      <SkeletonText h="26px" noOfLines={2} display={isCalculating ? "block" : "none"} />
      <Text
        as="div"
        ref={textRef}
        fontSize="sm"
        position={isCalculating ? "absolute" : "relative"}
        visibility={isCalculating ? "hidden" : "visible"}
        lineHeight={2}
        color="gray.600"
        textAlign="left"
        opacity={isCalculating ? 0 : 1}
        lineClamp={isExpanded ? undefined : 2}
        whiteSpace={isExpanded || !isTruncated ? "pre-line" : "normal"}
        wordBreak={isExpanded ? "normal" : "break-all"}
      >
        {message}
        {isTruncated && !isExpanded && (
          <Flex position="absolute" right="0" bottom="0" zIndex="1" bg="white">
            <Text w="1rem">...</Text>
            <Link
              variant="underline"
              color="currentcolor"
              textDecorationColor="currentcolor"
              onClick={() => setIsExpanded(true)}
            >
              全文表示
            </Link>
          </Flex>
        )}
      </Text>
    </Box>
  );
}
type loadingStatus = "loading" | "success" | "error";

function ReporterImage({
  reporterName,
  status,
  setStatus,
}: { reporterName: string; status: loadingStatus; setStatus: (status: loadingStatus) => void }) {
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
  }, [setStatus]);

  return (
    <>
      <Image
        ref={imgRef}
        src={src}
        alt={reporterName}
        w="150px"
        display={status === "success" ? "inline-block" : "none"}
        mb={{ base: "4", md: "0" }}
        mr={{ base: "0", md: "4" }}
        onLoad={() => setStatus("success")}
        onError={() => setStatus("error")}
      />
      <Box w="150px" h="50px" display={status === "success" ? "none" : "block"} />
    </>
  );
}

export function Reporter({ meta }: { meta: Meta }) {
  const [status, setStatus] = useState<loadingStatus>("loading");

  return (
    <Flex flexDirection="column" gap="4" color="gray.600">
      <Skeleton loading={status === "loading"} w="fit-content" asChild>
        <Flex flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "flex-start", md: "center" }}>
          <ReporterImage reporterName={meta.reporter} status={status} setStatus={setStatus} />
          <Flex flexDirection="column" justifyContent="space-between" color="gray.600">
            <Text fontSize="xs">レポーター</Text>
            <Text fontSize="md" fontWeight="bold">
              {meta?.reporter}
            </Text>
          </Flex>
        </Flex>
      </Skeleton>
      {meta.message && <MessageText message={meta.message} />}
      <Skeleton loading={status === "loading"} asChild>
        <Flex gap="3" flexWrap="wrap" w="fit-content">
          {!meta.isDefault && meta.webLink && (
            <Button
              variant="outline"
              size="md"
              fontSize="xs"
              color="currentcolor"
              _icon={{
                width: "14px",
                height: "14px",
              }}
              asChild
            >
              <a href={meta.webLink} target="_blank" rel="noopener noreferrer">
                <Flex gap="1" alignItems="center">
                  <Globe />
                  ウェブサイト
                </Flex>
              </a>
            </Button>
          )}
          {!meta.isDefault && meta.privacyLink && (
            <Button variant="outline" size="md" fontSize="xs" color="currentcolor" asChild>
              <a href={meta.privacyLink} target="_blank" rel="noopener noreferrer">
                プライバシーポリシー
              </a>
            </Button>
          )}
          {!meta.isDefault && meta.termsLink && (
            <Button variant="outline" size="md" fontSize="xs" color="currentcolor" asChild>
              <a href={meta.termsLink} target="_blank" rel="noopener noreferrer">
                利用規約
              </a>
            </Button>
          )}
        </Flex>
      </Skeleton>
    </Flex>
  );
}
