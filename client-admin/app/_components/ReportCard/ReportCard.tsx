import { IconButton } from "@/components/ui/icon-button";
import { MenuContent, MenuItem, MenuPositioner, MenuRoot, MenuTrigger, MenuTriggerItem } from "@/components/ui/menu";
import type { Report } from "@/type";
import { GridItem, Portal, Text } from "@chakra-ui/react";
import { Ellipsis, FileSpreadsheet, Pencil, TextIcon, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { ClusterEditDialog } from "./ClusterEditDialog/ClusterEditDialog";
import { ProgressSteps } from "./ProgressSteps/ProgressSteps";
import { ReportEditDialog } from "./ReportEditDialog/ReportEditDialog";
import { TokenUsage } from "./TokenUasge/TokenUsage";
import { VisibilityUpdate } from "./VisibilityUpdate/VisibilityUpdate";
import { csvDownload } from "./_actions/csvDownload";
import { csvDownloadForWindows } from "./_actions/csvDownloadForWindows";
import { reportDelete } from "./_actions/reportDelete";

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
        <MenuRoot>
          <MenuTrigger asChild>
            <IconButton variant="ghost" size="lg">
              <Ellipsis />
            </IconButton>
          </MenuTrigger>
          <Portal>
            <MenuContent textStyle="body/md/bold">
              <MenuItem
                value="edit"
                onClick={() => {
                  setIsEditDialogOpen(true);
                }}
                _icon={{
                  w: 5,
                  h: 5,
                }}
              >
                <Pencil />
                レポート名編集
              </MenuItem>
              {report.status === "ready" && (
                <MenuItem
                  value="edit-cluster"
                  onClick={() => {
                    setIsClusterEditDialogOpen(true);
                  }}
                  _icon={{
                    w: 5,
                    h: 5,
                  }}
                >
                  <TextIcon />
                  意見グループ編集
                </MenuItem>
              )}
              {report.status === "ready" && (
                <MenuRoot positioning={{ placement: "right-start", gutter: 4 }}>
                  <MenuTriggerItem
                    value="csv-download"
                    _icon={{
                      w: 5,
                      h: 5,
                    }}
                  >
                    <FileSpreadsheet />
                    CSVダウンロード
                  </MenuTriggerItem>
                  <Portal>
                    <MenuPositioner>
                      <MenuContent textStyle="body/md/bold">
                        <MenuItem
                          value="csv-download"
                          onClick={async () => {
                            await csvDownload(report.slug);
                          }}
                        >
                          CSVダウンロード
                        </MenuItem>
                        <MenuItem
                          value="csv-download-for-windows"
                          onClick={async () => {
                            await csvDownloadForWindows(report.slug);
                          }}
                        >
                          CSV for Excelダウンロード
                        </MenuItem>
                      </MenuContent>
                    </MenuPositioner>
                  </Portal>
                </MenuRoot>
              )}
              <MenuItem
                value="delete"
                color="fg.error"
                onClick={async () => {
                  await reportDelete(report.title, report.slug);
                }}
                _icon={{
                  w: 5,
                  h: 5,
                }}
              >
                <Trash2 />
                削除
              </MenuItem>
            </MenuContent>
          </Portal>
        </MenuRoot>
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
