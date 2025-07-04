import { MenuContent, MenuItem, MenuPositioner, MenuRoot, MenuTrigger, MenuTriggerItem } from "@/components/ui/menu";
import type { Report } from "@/type";
import { IconButton, Portal } from "@chakra-ui/react";
import { Ellipsis, FileSpreadsheet, Pencil, TextIcon, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { reportDelete } from "../_actions/reportDelete";
import { csvDownload } from "./csvDownload";
import { csvDownloadForWindows } from "./csvDownloadForWindows";

type Props = {
  report: Report;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsClusterEditDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export function ActionMenu({ report, setIsEditDialogOpen, setIsClusterEditDialogOpen }: Props) {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" size="lg" _hover={{ bg: "blue.50" }} _expanded={{ bg: "blue.50" }}>
          <Ellipsis />
        </IconButton>
      </MenuTrigger>
      <Portal>
        <MenuContent textStyle="body/md/bold">
          <MenuItem
            value="edit"
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
                value="csv-download"
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
                  <MenuContent textStyle="body/md/bold">
                    <MenuItem
                      value="csv-download"
                      onClick={async () => {
                        await csvDownload(report.slug);
                      }}
                    >
                      CSVダウンロード
                    </MenuItem>
                    <MenuItem
                      value="csv-download-for-windows"
                      onClick={async () => {
                        await csvDownloadForWindows(report.slug);
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
            value="delete"
            color="fg.error"
            onClick={async () => {
              await reportDelete(report.title, report.slug);
            }}
            _icon={{
              w: 5,
              h: 5,
            }}
          >
            <Trash2 />
            削除
          </MenuItem>
        </MenuContent>
      </Portal>
    </MenuRoot>
  );
}
