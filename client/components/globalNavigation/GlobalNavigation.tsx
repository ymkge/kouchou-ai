import { HStack } from "@chakra-ui/react";
import { CircleHelp, Files, Menu } from "lucide-react";
import { NavItem } from "./NavItem";
import { IconButton } from "../ui/icon-button";

const navItems = [
  { href: "/", label: "レポート一覧", icon: <Files /> },
  { href: "/faq/", label: "よくあるご質問", icon: <CircleHelp /> },
];

export function GlobalNavigation() {
  return (
    <>
      <HStack gap="1" hideBelow="md">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </HStack>
      <IconButton variant="ghost" size="xl" hideFrom="md">
        <Menu size="32px" />
      </IconButton>
    </>
  );
}
