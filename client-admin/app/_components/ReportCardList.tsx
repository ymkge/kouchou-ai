"use client";

import type { Report } from "@/type";
import { useState } from "react";
import { ReportCard } from "./ReportCard/ReportCard";

type Props = {
  reports: Report[];
};

export function ReportCardList({ reports: _reports }: Props) {
  const [reports, setReports] = useState<Report[]>(_reports);

  return (
    <>
      {reports.map((report) => (
        <ReportCard key={report.slug} report={report} reports={reports} setReports={setReports} />
      ))}
    </>
  );
}
