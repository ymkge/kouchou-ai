"use client";

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
import { Portal } from "@chakra-ui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { reportDelete } from "./_actions/reportDelete";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  slug: string;
};

export function DeleteDialog({ isOpen, setIsOpen, slug }: Props) {
  return (
    <DialogRoot open={isOpen} modal={true} closeOnInteractOutside={true} trapFocus={true}>
      <Portal>
        <DialogBackdrop
          zIndex={1000}
          position="fixed"
          inset={0}
          backgroundColor="blackAlpha.100"
          backdropFilter="blur(2px)"
        />
        <DialogContent pointerEvents="auto" position="relative" zIndex={1001} boxShadow="md">
          <DialogCloseTrigger position="absolute" top={3} right={3} onClick={() => setIsOpen(false)} />
          <DialogHeader>
            <DialogTitle>レポートを編集</DialogTitle>
          </DialogHeader>
          <DialogBody>delete</DialogBody>
          <DialogFooter>
            <Button>キャンセル</Button>
            <Button ml={3} onClick={async () => await reportDelete(slug)}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
}
