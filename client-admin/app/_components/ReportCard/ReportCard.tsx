import { IconButton } from "@/components/ui/icon-button";
import { MenuContent, MenuItem, MenuPositioner, MenuRoot, MenuTrigger, MenuTriggerItem } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import type { Report, ReportVisibility } from "@/type";
import { Box, GridItem, Portal, Select, Text, VStack } from "@chakra-ui/react";
import { Ellipsis, FileSpreadsheet, InfoIcon, Pencil, TextIcon, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { ClusterEditDialog } from "./ClusterEditDialog/ClusterEditDialog";
import { ProgressSteps } from "./ProgressSteps/ProgressSteps";
import { ReportEditDialog } from "./ReportEditDialog/ReportEditDialog";
import { csvDownload } from "./_actions/csvDownload";
import { csvDownloadForWindows } from "./_actions/csvDownloadForWindows";
import { reportDelete } from "./_actions/reportDelete";
import { visibilityOptions, visibilityUpdate } from "./_actions/visibilityUpdate";
import { analysisInfo } from "./analysisInfo/analysisInfo";

type Props = {
  report: Report;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function ReportCard({ report, reports, setReports }: Props) {
  // ダイアログの状態管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClusterEditDialogOpen, setIsClusterEditDialogOpen] = useState(false);

  const info = analysisInfo(report);
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
      <GridItem>
        <Tooltip
          content={
            <VStack alignItems="flex-start">
              {info.hasInput ? (
                <>
                  <Text>入力トークン/{info.tokenUsageInput}</Text>
                  <Text>出力トークン/{info.tokenUsageOutput}</Text>
                </>
              ) : (
                <Text>トークン使用量/{info.tokenUsageTotal}</Text>
              )}
              <Text>推定コスト/${info.estimatedCost}</Text>
            </VStack>
          }
        >
          <IconButton variant="ghost" size="lg">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </GridItem>
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
                onClick={async (e) => {
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
        {report.status === "ready" && (
          <Box>
            <Select.Root
              collection={visibilityOptions}
              size="sm"
              width="150px"
              defaultValue={[report.visibility.toString()]}
              onValueChange={async (value) => {
                // valueは配列の可能性があるため、最初の要素を取得
                const visibility = (Array.isArray(value?.value) ? value?.value[0] : value?.value) as ReportVisibility;
                if (!visibility || visibility === report.visibility.toString()) return;
                await visibilityUpdate({ slug: report.slug, visibility, reports, setReports });
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="公開状態" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {visibilityOptions.items.map((option) => (
                      <Select.Item item={option} key={option.value}>
                        {option.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
        )}
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
