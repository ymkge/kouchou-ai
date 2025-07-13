import { Button } from "@/components/ui/button";
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
import type { Report } from "@/type";
import { Center, Flex, Icon, Portal, Text, VStack } from "@chakra-ui/react";
import { FileText, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTransition } from "react";
import { reportDelete } from "./_actions/reportDelete";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  report: Report;
  setReports: Dispatch<SetStateAction<Report[]>>;
};

export function DeleteDialog({ isOpen, setIsOpen, report, setReports }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await reportDelete(report.slug);
      if (result.success) {
        setReports((prevReports) => prevReports.filter((r) => r.slug !== report.slug));
        setIsOpen(false);
      } else {
        toaster.create({
          type: "error",
          title: "エラー",
          description: result.error,
        });
      }
    });
  };

  return (
    <DialogRoot size="sm" placement="center" open={isOpen} modal={true} closeOnInteractOutside={true} trapFocus={true}>
      <Portal>
        <DialogBackdrop />
        <DialogContent>
          <DialogCloseTrigger onClick={() => setIsOpen(false)} />
          <DialogHeader justifyContent="center">
            <DialogTitle>
              <Icon color="font.error">
                <Trash2 />
              </Icon>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap="3" alignItems="stretch">
              <Text textStyle="body/lg/bold" textAlign="center">
                このレポートを
                <br />
                削除してよろしいですか？
              </Text>
              <Text textStyle="body/sm" textAlign="center">
                レポートは完全に削除されます。元に戻すことはできません。
              </Text>
              <Flex bg="bg.error" p="4" gap="3" alignItems="center">
                <Center w="48px" h="48px" flexShrink="0" bg="white" borderRadius="full">
                  <FileText />
                </Center>
                <Text textStyle="body/sm/bold">{report.title}</Text>
              </Flex>
            </VStack>
          </DialogBody>
          <DialogFooter justifyContent="center" pt="0" pb="8">
            <Button variant="tertiary" size="md" onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="secondary"
              size="md"
              color="font.error"
              borderColor="border.error"
              onClick={handleDelete}
              disabled={isPending}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
}
