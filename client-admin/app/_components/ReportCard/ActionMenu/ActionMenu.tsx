"use client";

import { downloadFile } from "@/app/utils/downloadFile";
import { MenuContent, MenuItem, MenuPositioner, MenuRoot, MenuTrigger, MenuTriggerItem } from "@/components/ui/menu";
import { toaster } from "@/components/ui/toaster";
import type { Report } from "@/type";
import { IconButton, Portal } from "@chakra-ui/react";
import { Ellipsis, FileSpreadsheet, FolderDown, Pencil, TextIcon, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useBuildDownload } from "../../BuildDownloadButton/useBuildDownload";
import { DeleteDialog } from "../DeleteDialog";
import { csvDownload } from "./csvDownload";
import { csvDownloadForWindows } from "./csvDownloadForWindows";

type Props = {
  report: Report;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsClusterEditDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export function ActionMenu({ report, setIsEditDialogOpen, setIsClusterEditDialogOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { handleDownload } = useBuildDownload();

  function handleExport(slug: string[]) {
    toaster.promise(handleDownload(slug), {
      success: {
        title: "HTML書き出し完了",
        description: "ダウンロードフォルダに保存されました。",
      },
      error: {
        title: "HTML書き出し失敗",
        description: "問題が解決しない場合は、管理者に問い合わせてください。",
      },
      loading: {
        title: "HTML書き出し中",
      },
    });
  }

  return (
    <>
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton variant="ghost" size="lg" _hover={{ bg: "blue.50" }} _expanded={{ bg: "blue.50" }}>
            <Ellipsis />
          </IconButton>
        </MenuTrigger>
        <Portal>
          <MenuContent>
            <MenuItem
              value="edit"
              textStyle="body/md/bold"
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
                textStyle="body/md/bold"
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
            {report.status === "ready" && report.isPubcom && (
              <MenuRoot positioning={{ placement: "right-start", gutter: 4 }}>
                <MenuTriggerItem
                  value="csv-download-list"
                  textStyle="body/md/bold"
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
                    <MenuContent>
                      <MenuItem
                        value="csv-download"
                        textStyle="body/md/bold"
                        onClick={async () => {
                          const result = await csvDownload(report.slug);
                          if (result.success) {
                            downloadFile(result);
                          } else {
                            toaster.create({
                              title: "エラー",
                              type: "error",
                              description: result.error,
                            });
                          }
                        }}
                      >
                        CSVダウンロード
                      </MenuItem>
                      <MenuItem
                        value="csv-download-for-windows"
                        textStyle="body/md/bold"
                        onClick={async () => {
                          const result = await csvDownloadForWindows(report.slug);
                          if (result.success) {
                            downloadFile(result);
                          } else {
                            toaster.create({
                              title: "エラー",
                              type: "error",
                              description: result.error,
                            });
                          }
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
              value="static-export"
              textStyle="body/md/bold"
              onClick={() => {
                handleExport([report.slug]);
              }}
              _icon={{
                w: 5,
                h: 5,
              }}
            >
              <FolderDown />
              HTML書き出し
            </MenuItem>
            <MenuItem
              value="delete"
              color="fg.error"
              textStyle="body/md/bold"
              _icon={{
                w: 5,
                h: 5,
              }}
              onClick={() => setIsOpen(true)}
            >
              <Trash2 />
              削除
            </MenuItem>
          </MenuContent>
        </Portal>
      </MenuRoot>
      <DeleteDialog isOpen={isOpen} setIsOpen={setIsOpen} report={report} />
    </>
  );
}
