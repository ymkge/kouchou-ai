"use client";

import { getImageFromServerSrc } from "@/app/utils/image-src";
import type { Meta } from "@/type";
import { Box, Button, Heading, Image, Text, VStack } from "@chakra-ui/react";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type AboutProps = {
  meta: Meta;
};

export function About({ meta }: AboutProps) {
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    // 画像の存在を確認
    fetch(getImageFromServerSrc("/meta/reporter.png"))
      .then(response => {
        setHasImage(response.status === 200);
      })
      .catch(() => {
        setHasImage(false);
      });
  }, []);

  return (
    <Box mx={"auto"} maxW={"750px"} mb={12}>
      <Heading textAlign={"center"} fontSize={"xl"} mb={5}>
        About
      </Heading>
      {hasImage && (
        <Image
          src={getImageFromServerSrc("/meta/reporter.png")}
          mx={"auto"}
          mb={5}
          objectFit={"cover"}
          maxW={"250px"}
          alt={meta.reporter}
        />
      )}
      <Text mb={5} whiteSpace={"pre-line"}>
        {meta.message}
      </Text>
      <VStack>
        {meta.webLink && (
          <Link
            href={meta.webLink}
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <Button
              size={"2xl"}
              minW={"300px"}
              bgColor={meta.brandColor || "#2577B1"}
            >
              <Image
                src={getImageFromServerSrc("/meta/icon.png")}
                w={30}
                alt={meta.reporter}
              />
              {meta.reporter}のページへ
              <ExternalLinkIcon />
            </Button>
          </Link>
        )}
      </VStack>
    </Box>
  );
}
