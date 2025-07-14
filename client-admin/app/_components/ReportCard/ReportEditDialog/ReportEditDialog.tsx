import { toaster } from "@/components/ui/toaster";
import type { Report } from "@/type";
import { Box, Button, Dialog, Input, Portal, Text, Textarea, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { updateReportConfig } from "./actions";

type Props = {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  report: Report;
};

export function ReportEditDialog({ isEditDialogOpen, setIsEditDialogOpen, report }: Props) {
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
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
            <form onSubmit={handleSubmit}>
              <Dialog.Body>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      タイトル
                    </Text>
                    <Input
                      name="question"
                      defaultValue={report.title}
                      placeholder="レポートのタイトルを入力"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontWeight="bold">
                      調査概要
                    </Text>
                    <Textarea
                      name="intro"
                      defaultValue={report.description || ""}
                      placeholder="調査の概要を入力"
                    />
                  </Box>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button ml={3} type="submit">
                  保存
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
