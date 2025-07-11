import type { Report } from "@/type";
import { Button, Flex, HStack, Heading, Icon, Link, Text, VStack } from "@chakra-ui/react";
import { Eye, EyeClosedIcon, LockKeyhole } from "lucide-react";
import { BuildDownloadButton } from "./BuildDownloadButton/BuildDownloadButton";
import { Empty } from "./Empty";
import { ReportCardList } from "./ReportCardList";

type Props = {
  reports: Report[];
};

export function PageContent({ reports }: Props) {
  return (
    <>
      <Flex justifyContent="space-between">
        <Heading textStyle="heading/xl">レポート管理</Heading>
        <Flex gap="3">
          <VStack gap="2" w="88px" h="80px" bg="white" justifyContent="center">
            <Icon color="font.public">
              <Eye />
            </Icon>
            <Text textStyle="body/lg/bold" lineHeight="1.38">
              0
            </Text>
          </VStack>
          <VStack gap="2" w="88px" h="80px" bg="white" justifyContent="center">
            <Icon color="font.limitedPublic">
              <LockKeyhole />
            </Icon>
            <Text textStyle="body/lg/bold" lineHeight="1.38">
              0
            </Text>
          </VStack>
          <VStack gap="2" w="88px" h="80px" bg="white" justifyContent="center">
            <Icon color="font.error">
              <EyeClosedIcon />
            </Icon>
            <Text textStyle="body/lg/bold" lineHeight="1.38">
              0
            </Text>
          </VStack>
        </Flex>
      </Flex>
      {reports.length === 0 ? (
        <Empty />
      ) : (
        <>
          <ReportCardList reports={reports} />
          <HStack justify="center" mt={10}>
            <Link href="/create">
              <Button size="xl">新しいレポートを作成する</Button>
            </Link>
            <BuildDownloadButton />
          </HStack>
        </>
      )}
    </>
  );
}
