import { toaster } from "@/components/ui/toaster";
import type { Report } from "@/type";
import { Box, Button, Dialog, Input, Portal, Text, Textarea, VStack } from "@chakra-ui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { getApiBaseUrl } from "../utils/api";

type Props = {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  report: Report;
  reports?: Report[];
  setReports: Dispatch<SetStateAction<Report[] | undefined>>;
};

export function ReportEditDialog({
  isEditDialogOpen,
  setIsEditDialogOpen,
  report,
  reports,
  setReports,
}: Props) {
  const [editTitle, setEditTitle] = useState(report.title);
  const [editDescription, setEditDescription] = useState(report.description || "");

  return (
    <Dialog.Root
      open={isEditDialogOpen}
      onOpenChange={({ open }) => setIsEditDialogOpen(open)}
      modal={true}
      closeOnInteractOutside={true}
      trapFocus={true}
    >
      <Portal>
        <Dialog.Backdrop
          zIndex={1000}
          position="fixed"
          inset={0}
          backgroundColor="blackAlpha.100"
          backdropFilter="blur(2px)"
        />
        <Dialog.Positioner>
          <Dialog.Content
            pointerEvents="auto"
            position="relative"
            zIndex={1001}
            boxShadow="md"
            onClick={(e) => e.stopPropagation()}
          >
            <Dialog.CloseTrigger position="absolute" top={3} right={3} />
            <Dialog.Header>
              <Dialog.Title>レポートを編集</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="bold">
                    タイトル
                  </Text>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="レポートのタイトルを入力"
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="bold">
                    調査概要
                  </Text>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="調査の概要を入力"
                  />
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                キャンセル
              </Button>
              <Button
                ml={3}
                onClick={async () => {
                  try {
                    const response = await fetch(`${getApiBaseUrl()}/admin/reports/${report.slug}/config`, {
                      method: "PATCH",
                      headers: {
                        "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        question: editTitle,
                        intro: editDescription,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.detail || "メタデータの更新に失敗しました");
                    }

                    // レポート一覧を更新
                    if (setReports && reports) {
                      const updatedReports = reports.map((r) =>
                        r.slug === report.slug
                          ? {
                              ...r,
                              title: editTitle,
                              description: editDescription,
                            }
                          : r,
                      );
                      setReports(updatedReports);
                    }

                    // 成功メッセージを表示
                    toaster.create({
                      type: "success",
                      title: "更新完了",
                      description: "レポート情報が更新されました",
                    });

                    // ダイアログを閉じる
                    setIsEditDialogOpen(false);
                  } catch (error) {
                    console.error("メタデータの更新に失敗しました:", error);
                    toaster.create({
                      type: "error",
                      title: "更新エラー",
                      description: "メタデータの更新に失敗しました",
                    });
                  }
                }}
              >
                保存
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
