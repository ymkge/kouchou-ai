import type { Report } from "@/type";
import { GridItem, Text } from "@chakra-ui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { ActionMenu } from "./ActionMenu/ActionMenu";
import { ClusterEditDialog } from "./ClusterEditDialog/ClusterEditDialog";
import { DeleteButton } from "./DeleteButton";
import { ProgressSteps } from "./ProgressSteps/ProgressSteps";
import { ReportEditDialog } from "./ReportEditDialog/ReportEditDialog";
import { ReportTtile } from "./ReportTitle";
import { TokenUsage } from "./TokenUasge/TokenUsage";
import { VisibilityUpdate } from "./VisibilityUpdate/VisibilityUpdate";

type Props = {
  report: Report;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ReportCard({ report, reports, setReports }: Props) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClusterEditDialogOpen, setIsClusterEditDialogOpen] = useState(false);

  return (
    <>
      <GridItem>
        <Text textStyle="body/sm">
          {report.createdAt
            ? new Date(report.createdAt).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-"}
        </Text>
      </GridItem>
      <GridItem ml="2" gridColumn={report.status !== "ready" ? "span 6" : "span 1"}>
        <ReportTtile report={report} />
      </GridItem>
      {report.status === "ready" && (
        <>
          <GridItem textStyle="body/md/bold" textAlign="center">
            {report.analysis?.commentNum}
          </GridItem>
          <GridItem textStyle="body/md/bold" textAlign="center">
            {report.analysis?.argumentsNum}
          </GridItem>
          <GridItem textStyle="body/md/bold" textAlign="center">
            {report.analysis?.clusterNum}
          </GridItem>
        </>
      )}
      {report.status === "ready" && (
        <GridItem>
          <TokenUsage report={report} />
        </GridItem>
      )}
      {report.status === "ready" && (
        <GridItem>
          <ActionMenu
            report={report}
            setIsEditDialogOpen={setIsEditDialogOpen}
            setIsClusterEditDialogOpen={setIsClusterEditDialogOpen}
          />
        </GridItem>
      )}
      <GridItem>
        {report.status === "ready" && <VisibilityUpdate report={report} reports={reports} setReports={setReports} />}
        {report.status === "error" && <DeleteButton report={report} />}
      </GridItem>
      <GridItem gridColumn="span 8">
        {(report.status === "processing" || report.status === "error") && (
          <ProgressSteps slug={report.slug} setReports={setReports} />
        )}
      </GridItem>

      <ReportEditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        report={report}
        reports={reports}
        setReports={setReports}
      />
      <ClusterEditDialog
        report={report}
        isOpen={isClusterEditDialogOpen}
        setIsClusterEditDialogOpen={setIsClusterEditDialogOpen}
      />
    </>
  );
}
