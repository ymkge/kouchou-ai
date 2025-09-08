import { HStack } from "@chakra-ui/react";
import { CircleHelp, Files } from "lucide-react";
import { NavItem } from "./NavItem";

const navItems = [
  { href: "/", label: "レポート一覧", icon: <Files /> },
  { href: "/faq/", label: "よくあるご質問", icon: <CircleHelp /> },
];

export function GlobalNavigation() {
  return (
    <HStack gap="1">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </HStack>
  );
}
