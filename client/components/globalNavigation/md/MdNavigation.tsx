import { HStack } from "@chakra-ui/react";
import type { NavItem as TNavItem } from "../GlobalNavigation";
import { NavItem } from "./NavItem";

type Props = {
  navItems: TNavItem;
};

export function MdNavigation({ navItems }: Props) {
  return (
    <HStack gap="1" hideBelow="md">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </HStack>
  );
}
