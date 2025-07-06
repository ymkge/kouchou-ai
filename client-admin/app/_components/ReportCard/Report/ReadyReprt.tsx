import type { Report } from "@/type";
import { GridItem, IconButton, Link } from "@chakra-ui/react";
import { LinkIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { ActionMenu } from "../ActionMenu/ActionMenu";
import { ClusterEditDialog } from "../ClusterEditDialog/ClusterEditDialog";
import { ReportCreatedAt } from "../ReportCreatedAt";
import { ReportEditDialog } from "../ReportEditDialog/ReportEditDialog";
import { ReportTtile } from "../ReportTitle";
import { TokenUsage } from "../TokenUasge/TokenUsage";
import { Visibility } from "../Visibility/Visibility";

type Props = {
  report: Report;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ReadyReport({ report, reports, setReports }: Props) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClusterEditDialogOpen, setIsClusterEditDialogOpen] = useState(false);

  return (
    <>
      <GridItem>
        <ReportCreatedAt createdAt={report.createdAt} />
      </GridItem>
      <GridItem ml="2">
        <ReportTtile report={report} />
      </GridItem>
      <GridItem>
        <Link href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`} target="_blank">
          <IconButton variant="ghost" size="lg" _hover={{ bg: "blue.50", boxShadow: "none" }}>
            <LinkIcon />
          </IconButton>
        </Link>
      </GridItem>
      <GridItem textStyle="body/md/bold" textAlign="center">
        {report.analysis?.commentNum}
      </GridItem>
      <GridItem textStyle="body/md/bold" textAlign="center">
        {report.analysis?.argumentsNum}
      </GridItem>
      <GridItem textStyle="body/md/bold" textAlign="center">
        {report.analysis?.clusterNum}
      </GridItem>
      <GridItem>
        <TokenUsage report={report} />
      </GridItem>
      <GridItem>
        <ActionMenu
          report={report}
          setIsEditDialogOpen={setIsEditDialogOpen}
          setIsClusterEditDialogOpen={setIsClusterEditDialogOpen}
        />
      </GridItem>
      <GridItem>
        <Visibility report={report} reports={reports} setReports={setReports} />
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
