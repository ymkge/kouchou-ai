"use client";

import type { Report } from "@/type";
import { Grid, GridItem } from "@chakra-ui/react";
import { useState } from "react";
import { ReportCard } from "./ReportCard/ReportCard";

type Props = {
  reports: Report[];
};

export function ReportCardList({ reports: _reports }: Props) {
  const [reports, setReports] = useState<Report[]>(_reports);

  return (
    <Grid templateColumns={"repeat(8, 1fr)"} rowGap={2}>
      <GridItem textStyle="body/sm" bg="blue.100" py="3" px="6" borderLeftRadius="sm">
        作成日時
      </GridItem>
      <GridItem textStyle="body/sm" bg="blue.100" py="3">
        レポート名
      </GridItem>
      {/* コメント */}
      <GridItem bg="blue.100" py="3" />
      {/* 意見 */}
      <GridItem bg="blue.100" py="3" />
      {/* 意見グループ */}
      <GridItem bg="blue.100" py="3" />
      {/* コスト */}
      <GridItem bg="blue.100" py="3" />
      {/* アクション */}
      <GridItem bg="blue.100" py="3" />
      {/* 公開状態 */}
      <GridItem bg="blue.100" py="3" borderRightRadius="sm" />
      {reports.map((report) => (
        <GridItem key={report.slug} colSpan={8}>
          <ReportCard key={report.slug} report={report} reports={reports} setReports={setReports} />
        </GridItem>
      ))}
    </Grid>
  );
}
