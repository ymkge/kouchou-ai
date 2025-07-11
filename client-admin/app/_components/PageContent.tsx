import type { Report } from "@/type";
import { Button, HStack, Heading, Link } from "@chakra-ui/react";
import { BuildDownloadButton } from "./BuildDownloadButton/BuildDownloadButton";
import { Empty } from "./Empty";
import { ReportCardList } from "./ReportCardList";

type Props = {
  reports: Report[];
};

export function PageContent({ reports }: Props) {
  return (
    <>
      <Heading textAlign="left" fontSize="xl" mb={8}>
        レポート一覧
      </Heading>
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
