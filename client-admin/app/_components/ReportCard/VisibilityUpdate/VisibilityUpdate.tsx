import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import type { Report, ReportVisibility } from "@/type";
import { IconButton, Portal } from "@chakra-ui/react";
import { Eye, EyeClosedIcon, LockKeyhole } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { visibilityUpdate } from "./visibilityUpdate";

type Props = {
  report: Report;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
};

const iconStyles = {
  public: {
    bg: "bg.public",
    color: "font.public",
    borderColor: "border.public",
    icon: <Eye />,
  },
  unlisted: {
    bg: "bg.limitedPublic",
    color: "font.limitedPublic",
    borderColor: "border.limitedPublic",
    icon: <LockKeyhole />,
  },
  private: {
    bg: "bg.private",
    color: "font.private",
    borderColor: "border.private",
    icon: <EyeClosedIcon />,
  },
};

export function VisibilityUpdate({ report, reports, setReports }: Props) {
  return (
    <MenuRoot
      onSelect={async (e) => {
        if (e.value === report.visibility) return;

        await visibilityUpdate({
          slug: report.slug,
          visibility: e.value as ReportVisibility,
          reports,
          setReports,
        });
      }}
    >
      <MenuTrigger asChild>
        <IconButton
          border="1px solid"
          {...iconStyles[report.visibility]}
          size="lg"
          _icon={{
            w: 5,
            h: 5,
          }}
        >
          {iconStyles[report.visibility].icon}
        </IconButton>
      </MenuTrigger>
      <Portal>
        <MenuContent textStyle="body/md/bold">
          <MenuItem
            value="public"
            color="font.public"
            border="1px solid"
            borderColor="transparent"
            _icon={{
              w: 5,
              h: 5,
            }}
            _hover={{
              borderColor: "border.public",
              bg: "bg.public",
            }}
          >
            <Eye />
            公開
          </MenuItem>
          <MenuItem
            value="unlisted"
            color="font.limitedPublic"
            border="1px solid"
            borderColor="transparent"
            _icon={{
              w: 5,
              h: 5,
            }}
            _hover={{
              borderColor: "border.limitedPublic",
              bg: "bg.limitedPublic",
            }}
          >
            <LockKeyhole />
            限定公開
          </MenuItem>
          <MenuItem
            value="private"
            color="font.private"
            border="1px solid"
            borderColor="transparent"
            _icon={{
              w: 5,
              h: 5,
            }}
            _hover={{
              borderColor: "border.private",
              bg: "bg.private",
            }}
          >
            <EyeClosedIcon />
            非公開
          </MenuItem>
        </MenuContent>
      </Portal>
    </MenuRoot>
  );
}
