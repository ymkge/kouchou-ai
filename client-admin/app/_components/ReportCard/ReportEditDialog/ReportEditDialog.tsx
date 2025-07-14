import { toaster } from "@/components/ui/toaster";
import type { Report } from "@/type";
import { Box, Button, Dialog, Input, Portal, Text, Textarea, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { updateReportConfig } from "./actions";

type Props = {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  report: Report;
};

export function ReportEditDialog({ isEditDialogOpen, setIsEditDialogOpen, report }: Props) {
  const [editTitle, setEditTitle] = useState(report.title);
  const [editDescription, setEditDescription] = useState(report.description || "");
  const router = useRouter();

  async function handleSubmit() {
    const formData = new FormData();
    formData.append("question", editTitle);
    formData.append("intro", editDescription);

    const result = await updateReportConfig(report.slug, formData);

    if (result.success) {
      router.refresh();

      toaster.create({
        type: "success",
        title: "更新完了",
        description: "レポート情報が更新されました",
      });

      setIsEditDialogOpen(false);
    } else {
      toaster.create({
        type: "error",
        title: "更新エラー",
        description: result.error || "メタデータの更新に失敗しました",
      });
    }
  }

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
              <Button ml={3} onClick={handleSubmit}>
                保存
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
