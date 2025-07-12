import { IconButton } from "@/components/ui/icon-button";
import type { Report } from "@/type";
import { Trash2 } from "lucide-react";
import { reportDelete } from "./_actions/reportDelete";

type Props = {
  report: Report;
};

export function DeleteButton({ report }: Props) {
  return (
    <IconButton
      variant="ghost"
      size="lg"
      color="font.error"
      onClick={async () => {
        await reportDelete(report.slug);
      }}
    >
      <Trash2 />
    </IconButton>
  );
}
