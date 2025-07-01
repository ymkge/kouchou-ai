import { Header } from "@/components/Header";
import type { Report } from "@/type";
import { Box, Button, HStack, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { BuildDownloadButton } from "./_components/BuildDownloadButton/BuildDownloadButton";
import { Empty } from "./_components/Empty";
import { ReportCardList } from "./_components/ReportCardList";
import { getApiBaseUrl } from "./utils/api";

export default async function Page() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/admin/reports`, {
      method: "GET",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return (
        <div className="container">
          <Header />
          <Box mx="auto" maxW="1000px" px="6" py="12">
            <Heading textAlign="center" fontSize="xl" mb={8}>
              レポートの取得に失敗しました
            </Heading>
          </Box>
        </div>
      );
    }

    const reports: Report[] = await response.json();

    return (
      <Box className="container" bgColor="bg.secondary">
        <Header />
        <Box mx="auto" maxW="1000px" px="6" py="12">
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
        </Box>
      </Box>
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return (
      <Box mx="auto" maxW="1000px" px="6" py="12">
        <Heading textAlign="center" fontSize="xl" mb={8}>
          レポートの取得に失敗しました
        </Heading>
      </Box>
    );
  }
}
