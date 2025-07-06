import type { Report } from "@/type";
import { GridItem, HStack, IconButton, Link, Text } from "@chakra-ui/react";
import { Bot, LinkIcon } from "lucide-react";
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
      <GridItem ml="2">
        <ReportTtile report={report} />
      </GridItem>
      {report.status === "ready" && (
        <GridItem>
          <Link href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`} target="_blank">
            <IconButton variant="ghost" size="lg" _hover={{ bg: "blue.50", boxShadow: "none" }}>
              <LinkIcon />
            </IconButton>
          </Link>
        </GridItem>
      )}
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
      {report.status === "ready" && (
        <GridItem>
          <VisibilityUpdate report={report} reports={reports} setReports={setReports} />
        </GridItem>
      )}
      {report.status === "processing" && (
        <GridItem gridColumn="span 7" ml="2">
          <HStack color="font.processing">
            <Bot />
            <Text textStyle="body/sm/bold">AIによるレポート作成中です。完了までしばらくお待ちください。</Text>
          </HStack>
        </GridItem>
      )}
      {report.status === "error" && (
        <>
          <GridItem gridColumn="span 6" ml="2">
            <HStack color="font.error">
              <Bot />
              <Text textStyle="body/sm/bold">エラーが発生しました。レポート生成設定を調整してください。</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <DeleteButton report={report} />
          </GridItem>
        </>
      )}
      <GridItem gridColumn="span 9" mt="3">
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
