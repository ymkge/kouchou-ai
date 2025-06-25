"use client";

import { getApiBaseUrl } from "@/app/utils/api";
import { Header } from "@/components/Header";
import { ClusterEditDialog } from "@/components/dialogs/ClusterEditDialog";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { toaster } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import type { ClusterResponse, Report } from "@/type";
import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  LinkBox,
  LinkOverlay,
  Popover,
  Portal,
  Select,
  Spinner,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleFadingArrowUpIcon,
  DownloadIcon,
  EllipsisIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { ProgressSteps } from "./_components/ProgressSteps/ProgressSteps";
import { ReportEditDialog } from "./_components/ReportEditDialog/ReportEditDialog";
import { useAnalysisInfo } from "./_hooks/useAnalysisInfo";

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

// 個々のレポートカードコンポーネント
function ReportCard({
  report,
  reports,
  setReports,
}: {
  report: Report;
  reports?: Report[];
  setReports: Dispatch<SetStateAction<Report[] | undefined>>;
}) {
  const statusDisplay = getStatusDisplay(report.status);

  // 編集ダイアログの状態管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // クラスタ編集ダイアログの状態管理
  const [isClusterEditDialogOpen, setIsClusterEditDialogOpen] = useState(false);
  const [clusters, setClusters] = useState<ClusterResponse[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | undefined>(undefined);
  const [editClusterTitle, setEditClusterTitle] = useState("");
  const [editClusterDescription, setEditClusterDescription] = useState("");

  // エラー状態の判定
  const isErrorState = report.status === "error";

  const analysisInfo = useAnalysisInfo(report);

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
                {analysisInfo.hasInput ? (
                  <>
                    入力: {analysisInfo.tokenUsageInput}, 出力: {analysisInfo.tokenUsageOutput}
                  </>
                ) : (
                  analysisInfo.tokenUsageTotal
                )}
              </Text>
              <Text fontSize="xs" color="gray.500" mb={1}>
                推定コスト: {analysisInfo.estimatedCost}
                {analysisInfo.model && ` (${analysisInfo.model})`}
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
                              try {
                                const response = await fetch(`${getApiBaseUrl()}/admin/comments/${report.slug}/csv`, {
                                  headers: {
                                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
                                    "Content-Type": "application/json",
                                  },
                                });
                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.detail || "CSV ダウンロードに失敗しました");
                                }
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `kouchou_${report.slug}.csv`;
                                link.click();
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error(error);
                              }
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
                              try {
                                const response = await fetch(`${getApiBaseUrl()}/admin/comments/${report.slug}/csv`, {
                                  headers: {
                                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
                                    "Content-Type": "application/json",
                                  },
                                });
                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.detail || "CSV ダウンロードに失敗しました");
                                }
                                const blob = await response.blob();
                                const text = await blob.text();
                                // UTF-8 BOMを追加
                                const bom = "\uFEFF";
                                const bomBlob = new Blob([bom + text], {
                                  type: "text/csv;charset=utf-8",
                                });
                                const url = window.URL.createObjectURL(bomBlob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `kouchou_${report.slug}_excel.csv`;
                                link.click();
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error(error);
                              }
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
                  const visibilityOptions = createListCollection({
                    items: [
                      { label: "公開", value: "public" },
                      { label: "限定公開", value: "unlisted" },
                      { label: "非公開", value: "private" },
                    ],
                  });

                  return (
                    <Select.Root
                      collection={visibilityOptions}
                      size="sm"
                      width="150px"
                      defaultValue={[report.visibility.toString()]}
                      onValueChange={async (value) => {
                        // valueは配列の可能性があるため、最初の要素を取得
                        const selected = Array.isArray(value?.value) ? value?.value[0] : value?.value;
                        if (!selected || selected === report.visibility.toString()) return;
                        try {
                          const response = await fetch(`${getApiBaseUrl()}/admin/reports/${report.slug}/visibility`, {
                            method: "PATCH",
                            headers: {
                              "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ visibility: selected }),
                          });
                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.detail || "公開状態の変更に失敗しました");
                          }
                          const data = await response.json();
                          const updatedReports = reports?.map((r) =>
                            r.slug === report.slug ? { ...r, visibility: data.visibility } : r,
                          );
                          setReports(updatedReports);
                        } catch (error) {
                          console.error(error);
                        }
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
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const response = await fetch(`${getApiBaseUrl()}/admin/reports/${report.slug}/cluster-labels`, {
                          headers: {
                            "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
                          },
                        });
                        if (!response.ok) {
                          throw new Error("クラスタ一覧の取得に失敗しました");
                        }
                        const data = await response.json();
                        setClusters(data.clusters || []);
                        if (data.clusters && data.clusters.length > 0) {
                          setSelectedClusterId(data.clusters[0].id);
                          setEditClusterTitle(data.clusters[0].label);
                          setEditClusterDescription(data.clusters[0].description);
                        } else {
                          setSelectedClusterId(undefined);
                          setEditClusterTitle("");
                          setEditClusterDescription("");
                        }
                        setIsClusterEditDialogOpen(true);
                      } catch (error) {
                        console.error(error);
                        toaster.create({
                          type: "error",
                          title: "エラー",
                          description: "クラスタ一覧の取得に失敗しました。",
                        });
                      }
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
                    if (confirm(`レポート「${report.title}」を削除してもよろしいですか？`)) {
                      try {
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASEPATH}/admin/reports/${report.slug}`,
                          {
                            method: "DELETE",
                            headers: {
                              "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
                              "Content-Type": "application/json",
                            },
                          },
                        );
                        if (response.ok) {
                          alert("レポートを削除しました");
                          window.location.reload();
                        } else {
                          const errorData = await response.json();
                          throw new Error(errorData.detail || "レポートの削除に失敗しました");
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }
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

      {/* クラスタ編集ダイアログ */}
      <ClusterEditDialog
        report={report}
        isOpen={isClusterEditDialogOpen}
        onClose={() => setIsClusterEditDialogOpen(false)}
        clusters={clusters}
        setClusters={setClusters}
        selectedClusterId={selectedClusterId}
        setSelectedClusterId={setSelectedClusterId}
        editClusterTitle={editClusterTitle}
        setEditClusterTitle={setEditClusterTitle}
        editClusterDescription={editClusterDescription}
        setEditClusterDescription={setEditClusterDescription}
      />
    </LinkBox>
  );
}

function DownloadBuildButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/download");

      if (!res.ok) {
        throw new Error("ビルドに失敗しました");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const match = contentDisposition?.match(/filename="?(.+)"?/);
      const filename = match?.[1] ?? "kouchou-ai.zip";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toaster.create({
        type: "success",
        duration: 5000,
        title: "エクスポート完了",
        description: "ダウンロードフォルダに保存されました。",
      });
    } catch (error) {
      toaster.create({
        type: "error",
        duration: 5000,
        title: "エクスポート失敗",
        description: "問題が解決しない場合は、管理者に問い合わせてください。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="xl" onClick={handleDownload} loading={isLoading} loadingText="エクスポート中">
      全レポートをエクスポート
    </Button>
  );
}

const EmptyState = () => {
  return (
    <VStack mt={8} gap={0} lineHeight={2}>
      <Text fontSize="18px" fontWeight="bold">
        レポートが0件です
      </Text>
      <Text fontSize="14px" textAlign={{ md: "center" }} mt={5}>
        レポートが作成されるとここに一覧が表示され、
        <Box as="br" display={{ base: "none", md: "block" }} />
        公開やダウンロードなどの操作が行えるようになります。
      </Text>
      <Text fontSize="12px" color="gray.500" mt={3}>
        レポート作成が開始済みの場合は、AI分析が完了するまでしばらくお待ちください。
      </Text>
      <Image src="images/report-empty.png" mt={8} />
      <Box mt={8}>
        <Link href="/create">
          <Button size="xl">新しいレポートを作成する</Button>
        </Link>
      </Box>
    </VStack>
  );
};

export default function Page() {
  const [reports, setReports] = useState<Report[]>();

  useEffect(() => {
    (async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASEPATH}/admin/reports`, {
        method: "GET",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) return;
      setReports(await response.json());
    })();
  }, []);

  return (
    <div className="container">
      <Header />
      <Box mx="auto" maxW="1000px">
        <Heading textAlign="left" fontSize="xl" mb={8}>
          レポート一覧
        </Heading>
        {!reports && (
          <VStack>
            <Spinner />
          </VStack>
        )}
        {reports && reports.length === 0 && <EmptyState />}
        {reports && reports.length > 0 && (
          <>
            {reports.map((report) => (
              <ReportCard key={report.slug} report={report} reports={reports} setReports={setReports} />
            ))}
            <HStack justify="center" mt={10}>
              <Link href="/create">
                <Button size="xl">新しいレポートを作成する</Button>
              </Link>
              <DownloadBuildButton />
              <Link href="/environment">
                <Button size="xl" variant="outline">
                  環境検証
                </Button>
              </Link>
            </HStack>
          </>
        )}
      </Box>
    </div>
  );
}
