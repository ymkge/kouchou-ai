import type { Meta } from "@/type";
import { Alert, HStack, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function Header() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASEPATH}/meta`)
      .then(response => response.json())
      .then(data => setMeta(data))
      .catch(() => setMeta(null));
  }, []);

  useEffect(() => {
    if (!meta) {
      setHasImage(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_BASEPATH}/meta/reporter.png`)
      .then(res => setHasImage(res.status === 200))
      .catch(() => setHasImage(false));
  }, [meta]);

  return (
    <HStack
      justify="space-between"
      alignItems={"center"}
      mb={8}
      mx={"auto"}
      maxW={"1200px"}
    >
      <HStack>
        {meta && hasImage && (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_BASEPATH}/meta/reporter.png`}
            mx={"auto"}
            objectFit={"cover"}
            maxH={{ base: "40px", md: "60px" }}
            maxW={{ base: "120px", md: "200px" }}
            alt={meta.reporter}
          />
        )}
      </HStack>
      <HStack>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title fontSize={"md"}>管理者画面</Alert.Title>
            <Alert.Description>
              このページはレポート作成者向けの管理画面です
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </HStack>
    </HStack>
  );
}
