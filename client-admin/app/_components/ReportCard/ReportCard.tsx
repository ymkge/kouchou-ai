import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import type { Report, ReportVisibility } from "@/type";
import { Box, Button, Grid, GridItem, HStack, Icon, Popover, Portal, Select, Text, VStack } from "@chakra-ui/react";
import { DownloadIcon, EllipsisIcon } from "lucide-react";
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
      <Grid p="6" bgColor="white" borderRadius="sm" color="font.primary">
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
          {/* <Text fontSize="xs" color="gray.500" mb={1}>
              トークン使用量:{" "}
              {info.hasInput ? (
                <>
                  入力: {info.tokenUsageInput}, 出力: {info.tokenUsageOutput}
                </>
              ) : (
                info.tokenUsageTotal
              )}
            </Text>
            <Text fontSize="xs" color="gray.500" mb={1}>
              推定コスト: {info.estimatedCost}
              {info.model && ` (${info.model})`}
            </Text> */}
        </GridItem>
        <HStack position="relative" zIndex="20">
          {report.status === "ready" && report.isPubcom && (
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Tooltip content="CSVファイルをダウンロード" openDelay={0} closeDelay={0}>
                    <Icon>
                      <DownloadIcon />
                    </Icon>
                  </Tooltip>
                </Button>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Arrow />
                    <Popover.Body p={0}>
                      <VStack align="stretch" gap={0}>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          borderRadius={0}
                          py={2}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await csvDownload(report.slug);
                          }}
                        >
                          CSV
                        </Button>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          borderRadius={0}
                          py={2}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await csvDownloadForWindows(report.slug);
                          }}
                        >
                          CSV for Excel(Windows)
                        </Button>
                      </VStack>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          )}
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
          <MenuRoot>
            <MenuTrigger asChild>
              <Button variant="ghost" size="lg" onClick={(e) => e.stopPropagation()}>
                <EllipsisIcon />
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="duplicate">レポートを複製して新規作成(開発中)</MenuItem>
              <MenuItem
                value="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDialogOpen(true);
                }}
              >
                レポートを編集する
              </MenuItem>
              {report.status === "ready" && (
                <MenuItem
                  value="edit-cluster"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClusterEditDialogOpen(true);
                  }}
                >
                  意見グループを編集する
                </MenuItem>
              )}
              <MenuItem
                value="delete"
                color="fg.error"
                onClick={async (e) => {
                  e.stopPropagation();
                  await reportDelete(report.title, report.slug);
                }}
              >
                レポートを削除する
              </MenuItem>
            </MenuContent>
          </MenuRoot>
          {report.status !== "ready" && <ProgressSteps slug={report.slug} setReports={setReports} />}
        </HStack>
      </Grid>
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
