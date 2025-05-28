"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import type { Meta } from "@/type";
import { Box, Button, Flex, Image, Link, Skeleton, SkeletonText, Text } from "@chakra-ui/react";
import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function EmptyText({ loading }: { loading: boolean }) {
  return (
    <SkeletonText loading={loading} noOfLines={1}>
      <Text fontSize="sm" color="gray.500">
        レポーター情報が未設定です。レポート作成者が
        <Link
          href="https://github.com/digitaldemocracy2030/kouchou-ai/blob/main/README.md#%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97"
          target="_blank"
          rel="noopener noreferrer"
          variant="underline"
          color="currentcolor"
        >
          メタデータをセットアップ
        </Link>
        することでレポーター情報が表示されます。
      </Text>
    </SkeletonText>
  );
}

type LoadingStatus = "loading" | "success" | "error";

function MessageText({
  isDefault,
  message,
  reporterImgLoadingStatus,
}: { isDefault: boolean; message: string; reporterImgLoadingStatus: LoadingStatus }) {
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

  // metdataが未設定の場合は、設定方法を案内するテキストを表示
  if (isDefault) {
    return <EmptyText loading={reporterImgLoadingStatus === "loading"} />;
  }

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

function ReporterImage({
  reporterName,
  reporterImgLoadingStatus,
  setReporterImgLoadingStatus,
}: {
  reporterName: string;
  reporterImgLoadingStatus: LoadingStatus;
  setReporterImgLoadingStatus: (status: LoadingStatus) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const src = getImageFromServerSrc("/meta/reporter.png");

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      // 画像がすでに読み込まれているかどうかをチェック
      if (img.naturalWidth === 0) {
        setReporterImgLoadingStatus("error");
      } else {
        setReporterImgLoadingStatus("success");
      }
    }
  }, [setReporterImgLoadingStatus]);

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={reporterName}
      display={reporterImgLoadingStatus === "error" ? "none" : "inline-block"}
      maxW="150px"
      mb={{ base: "4", md: "0" }}
      mr={{ base: "0", md: "4" }}
      onLoad={() => setReporterImgLoadingStatus("success")}
      onError={() => setReporterImgLoadingStatus("error")}
    />
  );
}

export function Reporter({ meta }: { meta: Meta }) {
  const [reporterImgLoadingStatus, setReporterImgLoadingStatus] = useState<LoadingStatus>("loading");

  return (
    <Flex flexDirection="column" gap="4" color="gray.600">
      <Skeleton loading={reporterImgLoadingStatus === "loading"} w="fit-content" asChild>
        <Flex flexDirection={{ base: "column", md: "row" }} alignItems="flex-start">
          <ReporterImage
            reporterName={meta.reporter}
            reporterImgLoadingStatus={reporterImgLoadingStatus}
            setReporterImgLoadingStatus={setReporterImgLoadingStatus}
          />
          <Flex flexDirection="column" justifyContent="space-between" color="gray.600" gap="2">
            <Text fontSize="xs">レポーター</Text>
            {/* metadataが未設定の場合は、レポーター名は非表示 */}
            {!meta.isDefault && (
              <Text fontSize="md" fontWeight="bold">
                {meta.reporter}
              </Text>
            )}
          </Flex>
        </Flex>
      </Skeleton>
      <MessageText
        isDefault={meta.isDefault}
        message={meta.message}
        reporterImgLoadingStatus={reporterImgLoadingStatus}
      />
      <Skeleton loading={reporterImgLoadingStatus === "loading"} asChild>
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
                  ウェブページ
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
