import { getApiBaseUrl } from "@/app/utils/api";
import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import type { ClusterResponse, Report } from "@/type";
import {
  Box,
  Button,
  Heading,
  Input,
  Portal,
  Select,
  Separator,
  Text,
  Textarea,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

type ClusterEditDialogProps = {
  report: Report;
  isOpen: boolean;
  setIsClusterEditDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export function ClusterEditDialog({ report, isOpen, setIsClusterEditDialogOpen }: ClusterEditDialogProps) {
  const [selectedClusterId, setSelectedClusterId] = useState<string | undefined>(undefined);
  const [editClusterTitle, setEditClusterTitle] = useState("");
  const [editClusterDescription, setEditClusterDescription] = useState("");
  const [clusters, setClusters] = useState<ClusterResponse[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(1); // デフォルトの階層は1

  // 利用可能な階層レベルを取得
  const availableLevels = useMemo(() => {
    const levels = [...new Set(clusters.map((c) => c.level))].sort((a, b) => a - b);
    return levels.length > 0 ? levels : [1];
  }, [clusters]);

  // 選択された階層の意見グループのみをフィルタリング
  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => c.level === selectedLevel);
  }, [clusters, selectedLevel]);

  // クラスター一覧を取得する共通関数
  const fetchClusters = useCallback(async () => {
    try {
      const clusterResponse = await fetch(`${getApiBaseUrl()}/admin/reports/${report.slug}/cluster-labels`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });
      if (clusterResponse.ok) {
        const clusterData = await clusterResponse.json();
        setClusters(clusterData.clusters);
        return clusterData.clusters;
      }
      return null;
    } catch (error) {
      console.error("意見グループ情報の取得に失敗しました:", error);
      return null;
    }
  }, [report.slug]);

  const fetchInitialClusters = useCallback(async () => {
    const clusters = await fetchClusters();
    if (clusters === null) {
      toaster.create({
        type: "error",
        title: "エラー",
        description: "クラスタ一覧の取得に失敗しました。",
      });
      return;
    }
    setClusterData(clusters);
  }, [fetchClusters]);

  const setClusterData = useCallback((clusters: ClusterResponse[]) => {
    if (clusters && clusters.length > 0) {
      setSelectedClusterId(clusters[0].id);
      setEditClusterTitle(clusters[0].label);
      setEditClusterDescription(clusters[0].description);
    } else {
      setSelectedClusterId(undefined);
      setEditClusterTitle("");
      setEditClusterDescription("");
    }
  }, []);

  // 階層が変更されたら意見グループの先頭を自動選択
  useEffect(() => {
    setClusterData(filteredClusters);
  }, [filteredClusters, setClusterData]);

  useEffect(() => {
    if (isOpen) {
      fetchInitialClusters();
    }
  }, [fetchInitialClusters, isOpen]);

  async function handleSubmit() {
    if (!selectedClusterId) return;
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin/reports/${report.slug}/cluster-label`, {
        method: "PATCH",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedClusterId,
          label: editClusterTitle,
          description: editClusterDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.detail || "意見グループ情報の更新に失敗しました";
        if (response.status === 400) {
          errorMessage = `入力データが不正です: ${errorMessage}`;
        } else if (response.status === 404) {
          errorMessage = "指定されたレポートの意見グループが見つかりません";
        }
        throw new Error(errorMessage);
      }
      // 意見グループ一覧を再取得して更新
      const updatedClusters = await fetchClusters();
      if (updatedClusters) {
        // 更新された意見グループ情報をフォームに再設定
        const updatedSelectedCluster = updatedClusters.find((c: ClusterResponse) => c.id === selectedClusterId);
        if (updatedSelectedCluster) {
          setEditClusterTitle(updatedSelectedCluster.label);
          setEditClusterDescription(updatedSelectedCluster.description);
        }
      } else {
        // クラスター一覧取得のエラーを処理
        console.error("意見グループ一覧の取得に失敗しました");
        toaster.create({
          type: "warning",
          title: "一部データの取得に失敗",
          description: "最新の意見グループ一覧の取得に失敗しましたが、変更は保存されています",
        });
      }

      toaster.create({
        type: "success",
        title: "更新完了",
        description: "意見グループ情報が更新されました",
      });
      setIsClusterEditDialogOpen(false);
    } catch (error) {
      console.error("意見グループ情報の更新に失敗しました:", error);
      toaster.create({
        type: "error",
        title: "更新エラー",
        description: "意見グループ情報の更新に失敗しました",
      });
    }
  }

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={({ open }) => setIsClusterEditDialogOpen(open)}
      modal={true}
      closeOnInteractOutside={true}
      trapFocus={true}
    >
      <Portal>
        <DialogBackdrop />
        <DialogContent>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>意見グループを編集</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Heading size="md">編集対象の選択</Heading>
              <Box>
                <Text mb={2} fontWeight="bold">
                  意見グループの階層
                </Text>
                <Select.Root
                  collection={createListCollection({
                    items: availableLevels.map((level) => ({ label: `第${level}階層`, value: level })),
                  })}
                  value={[String(selectedLevel)]}
                  onValueChange={(item) => {
                    if (item?.value) {
                      const level = Array.isArray(item.value) ? item.value[0] : item.value;
                      setSelectedLevel(Number(level));
                    }
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText>{`第${selectedLevel}階層`}</Select.ValueText>
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {availableLevels.map((level) => (
                        <Select.Item item={{ label: `第${level}階層`, value: level }} key={level}>
                          第{level}階層
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
              <Box>
                <Text mb={2} fontWeight="bold">
                  編集対象のグループ
                </Text>
                <Select.Root
                  collection={createListCollection({
                    items: filteredClusters.map((c) => ({ label: c.label, value: c.id })),
                  })}
                  value={selectedClusterId ? [selectedClusterId] : []}
                  onValueChange={(item) => {
                    if (item?.value) {
                      const selectedId = Array.isArray(item.value) ? item.value[0] : item.value;
                      setSelectedClusterId(selectedId);
                      const selected = clusters.find((c) => c.id === selectedId);
                      if (selected) {
                        setEditClusterTitle(selected.label);
                        setEditClusterDescription(selected.description);
                      }
                    }
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText>
                        {selectedClusterId
                          ? clusters.find((c) => c.id === selectedClusterId)?.label || "意見グループを選択"
                          : "意見グループを選択"}
                      </Select.ValueText>
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {filteredClusters.map((c) => (
                        <Select.Item item={{ label: c.label, value: c.id }} key={c.id}>
                          {c.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
              {selectedClusterId && (
                <>
                  <Separator my={4} />
                  <Heading size="md">意見グループの編集</Heading>
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      タイトル
                    </Text>
                    <Input
                      value={editClusterTitle}
                      onChange={(e) => setEditClusterTitle(e.target.value)}
                      placeholder="タイトルを入力"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      説明
                    </Text>
                    <Textarea
                      value={editClusterDescription}
                      onChange={(e) => setEditClusterDescription(e.target.value)}
                      placeholder="説明を入力"
                      height="150px"
                    />
                  </Box>
                </>
              )}
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClusterEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button ml={3} disabled={!selectedClusterId} onClick={handleSubmit}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
}
