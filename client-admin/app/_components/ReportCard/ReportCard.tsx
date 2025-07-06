import type { Report } from "@/type";
import type { Dispatch, SetStateAction } from "react";
import { ErrorReport } from "./Report/ErrorReport";
import { ProcessingReport } from "./Report/ProcessingReport";
import { ReadyReport } from "./Report/ReadyReprt";

type Props = {
  report: Report;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ReportCard({ report, reports, setReports }: Props) {
  return (
    <>
      {report.status === "ready" && <ReadyReport report={report} reports={reports} setReports={setReports} />}
      {report.status === "processing" && <ProcessingReport report={report} setReports={setReports} />}
      {report.status === "error" && <ErrorReport report={report} setReports={setReports} />}
    </>
  );
}
