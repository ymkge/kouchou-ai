import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import type { Report, ReportVisibility } from "@/type";
import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Icon,
  LinkBox,
  LinkOverlay,
  Popover,
  Portal,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleFadingArrowUpIcon,
  DownloadIcon,
  EllipsisIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { ClusterEditDialog } from "./ClusterEditDialog/ClusterEditDialog";
import { ProgressSteps } from "./ProgressSteps/ProgressSteps";
import { ReportEditDialog } from "./ReportEditDialog/ReportEditDialog";
import { csvDownload } from "./_actions/csvDownload";
import { csvDownloadForWindows } from "./_actions/csvDownloadForWindows";
import { reportDelete } from "./_actions/reportDelete";
import { visibilityOptions, visibilityUpdate } from "./_actions/visibilityUpdate";
import { analysisInfo } from "./analysisInfo/analysisInfo";

// ステータスに応じた表示内容を返す関数
function getStatusDisplay(status: string) {
  switch (status) {
    case "ready":
      return {
        borderColor: "green",
        iconColor: "green",
        textColor: "#2577b1",
        icon: <CircleCheckIcon size={30} />,
      };
    case "error":
      return {
        borderColor: "red.600",
        iconColor: "red.600",
        textColor: "red.600",
        icon: <CircleAlertIcon size={30} />,
      };
    default:
      return {
        borderColor: "gray",
        iconColor: "gray",
        textColor: "gray",
        icon: <CircleFadingArrowUpIcon size={30} />,
      };
  }
}

type Props = {
  report: Report;
  reports?: Report[];
  setReports: Dispatch<SetStateAction<Report[] | undefined>>;
};

export function ReportCard({ report, reports, setReports }: Props) {
  // ダイアログの状態管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClusterEditDialogOpen, setIsClusterEditDialogOpen] = useState(false);

  const statusDisplay = getStatusDisplay(report.status);
  const info = analysisInfo(report);
  const isErrorState = report.status === "error";

  return (
    <LinkBox
      as={Card.Root}
      key={report.slug}
      mb={4}
      borderLeftWidth={10}
      borderLeftColor={isErrorState ? "red.600" : statusDisplay.borderColor}
      position="relative"
      transition="all 0.2s"
      pointerEvents={isEditDialogOpen ? "none" : "auto"}
      _hover={
        report.status === "ready" && !isEditDialogOpen
          ? {
              backgroundColor: "gray.50",
              cursor: "pointer",
            }
          : {}
      }
      onClick={(e) => {
        if (report.status === "ready") {
          window.open(`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`, "_blank");
        }
        return true;
      }}
    >
      <Card.Body>
        <HStack justify="space-between">
          <HStack>
            <Box mr={3} color={isErrorState ? "red.600" : statusDisplay.iconColor}>
              {isErrorState ? <CircleAlertIcon size={30} /> : statusDisplay.icon}
            </Box>
            <Box>
              <LinkOverlay href={`/${report.slug}`} target="_blank" rel="noopener noreferrer">
                <Text fontSize="md" fontWeight="bold" color={isErrorState ? "red.600" : statusDisplay.textColor}>
                  {report.title}
                </Text>
              </LinkOverlay>
              <Card.Description>{`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`}</Card.Description>
              {report.createdAt && (
                <Text fontSize="xs" color="gray.500" mb={1}>
                  作成日時:{" "}
                  {new Date(report.createdAt).toLocaleString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                  })}
                </Text>
              )}
              <Text fontSize="xs" color="gray.500" mb={1}>
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
              </Text>
              {report.status !== "ready" && <ProgressSteps slug={report.slug} setReports={setReports} />}
            </Box>
          </HStack>
          {report.status === "ready" && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backgroundColor="blackAlpha.100"
              opacity="0"
              transition="opacity 0.2s"
              _hover={{ opacity: 1 }}
              pointerEvents="auto"
              zIndex="10"
            >
              <Button variant="solid" size="sm" bg="white" color="black" zIndex="50" pointerEvents="auto">
                <Flex align="center" gap={2}>
                  <ExternalLinkIcon size={16} />
                  <Text>レポートを見る</Text>
                </Flex>
              </Button>
            </Box>
          )}
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
              <Box
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {(() => {
                  return (
                    <Select.Root
                      collection={visibilityOptions}
                      size="sm"
                      width="150px"
                      defaultValue={[report.visibility.toString()]}
                      onValueChange={async (value) => {
                        // valueは配列の可能性があるため、最初の要素を取得
                        const visibility = (
                          Array.isArray(value?.value) ? value?.value[0] : value?.value
                        ) as ReportVisibility;
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
                  );
                })()}
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
          </HStack>
        </HStack>
      </Card.Body>

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
    </LinkBox>
  );
}
