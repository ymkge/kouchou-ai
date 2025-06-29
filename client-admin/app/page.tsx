"use client";

import { Header } from "@/components/Header";
import type { Report } from "@/type";
import { Box, Button, HStack, Heading, Spinner, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BuildDownloadButton } from "./_components/BuildDownloadButton/BuildDownloadButton";
import { Empty } from "./_components/Empty";
import { ReportCard } from "./_components/ReportCard/ReportCard";

export default function Page() {
  const [reports, setReports] = useState<Report[]>();

  useEffect(() => {
    (async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASEPATH}/admin/reports`, {
        method: "GET",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) return;
      setReports(await response.json());
    })();
  }, []);

  return (
    <div className="container">
      <Header />
      <Box mx="auto" maxW="1000px" px="6" py="12">
        <Heading textAlign="left" fontSize="xl" mb={8}>
          レポート一覧
        </Heading>
        {!reports && (
          <VStack>
            <Spinner />
          </VStack>
        )}
        {reports && reports.length === 0 && <Empty />}
        {reports && reports.length > 0 && (
          <>
            {reports.map((report) => (
              <ReportCard key={report.slug} report={report} reports={reports} setReports={setReports} />
            ))}
            <HStack justify="center" mt={10}>
              <Link href="/create">
                <Button size="xl">新しいレポートを作成する</Button>
              </Link>
              <BuildDownloadButton />
              <Link href="/environment">
                <Button size="xl" variant="outline">
                  環境検証
                </Button>
              </Link>
            </HStack>
          </>
        )}
      </Box>
    </div>
  );
}
