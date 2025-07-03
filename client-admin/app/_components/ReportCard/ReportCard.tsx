import type { Report } from "@/type";
import { GridItem, Text } from "@chakra-ui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { ActionMenu } from "./ActionMenu/ActionMenu";
import { ClusterEditDialog } from "./ClusterEditDialog/ClusterEditDialog";
import { ProgressSteps } from "./ProgressSteps/ProgressSteps";
import { ReportEditDialog } from "./ReportEditDialog/ReportEditDialog";
import { TokenUsage } from "./TokenUasge/TokenUsage";
import { VisibilityUpdate } from "./VisibilityUpdate/VisibilityUpdate";

type Props = {
  report: Report;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ReportCard({ report, reports, setReports }: Props) {
  // ダイアログの状態管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClusterEditDialogOpen, setIsClusterEditDialogOpen] = useState(false);

  const isErrorState = report.status === "error";

  return (
    <>
      <GridItem>
        <Text textStyle="body/sm">
          {report.createdAt
            ? new Date(report.createdAt).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-"}
        </Text>
      </GridItem>
      <GridItem>
        <Text textStyle="body/md/bold" truncate>
          {report.title}
        </Text>
      </GridItem>
      <GridItem>{report.status === "ready" && <TokenUsage report={report} />}</GridItem>
      <GridItem>
        {report.status === "ready" && (
          <ActionMenu
            report={report}
            setIsEditDialogOpen={setIsEditDialogOpen}
            setIsClusterEditDialogOpen={setIsClusterEditDialogOpen}
          />
        )}
      </GridItem>
      <GridItem>
        {report.status === "ready" && <VisibilityUpdate report={report} reports={reports} setReports={setReports} />}
      </GridItem>
      <GridItem gridColumn="span 5">
        {report.status !== "ready" && <ProgressSteps slug={report.slug} setReports={setReports} />}
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
