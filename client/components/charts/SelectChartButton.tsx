import { RadioCardItem, RadioCardRoot } from "@/components/ui/radio-card";
import { Tooltip } from "@/components/ui/tooltip";
import { Button, HStack, Icon, VStack, useBreakpointValue } from "@chakra-ui/react";
import { CogIcon, FullscreenIcon } from "lucide-react";
import type React from "react";
import { AllViewIcon, DenseViewIcon, HierarchyViewIcon } from "@/components/icons/ViewIcons";

type Props = {
  selected: string;
  onChange: (value: string) => void;
  onClickDensitySetting: () => void;
  onClickFullscreen: () => void;
  isDenseGroupEnabled: boolean;
};

export function SelectChartButton({
  selected,
  onChange,
  onClickDensitySetting,
  onClickFullscreen,
  isDenseGroupEnabled,
}: Props) {
  const isVertical = useBreakpointValue({ base: true, md: false });
  
  return (
    <HStack
      w={"100%"}
      maxW={"1200px"}
      mx={"auto"}
      justify={"space-between"}
      align={"center"}
      mb={2}
    >
      <RadioCardRoot
        orientation={isVertical ? "vertical" : "horizontal"}
        align="center"
        justify="center"
        w={"100%"}
        maxW={"xl"}
        size={"md"}
        display={"block"}
        value={selected}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        colorPalette={"gray"}
        bg={"gray.100"}
        _selected={{ bg: "gray.200", color: "gray.500" }}
        mx={"auto"}
      >
        {isVertical ? (
          <VStack align={"stretch"} gap={2}>
            <RadioCardItem
              value={"scatterAll"}
              label={"全体"}
              indicator={false}
              icon={
                <Icon>
                  <AllViewIcon />
                </Icon>
              }
              cursor={"pointer"}
            />
            <RadioCardItem
              value={"scatterDensity"}
              label={"濃い意見"}
              indicator={false}
              icon={
                <Icon>
                  <DenseViewIcon />
                </Icon>
              }
              cursor={"pointer"}
              disabled={!isDenseGroupEnabled}
              disabledReason={"この設定条件では抽出できませんでした"}
            />
            <RadioCardItem
              value={"treemap"}
              label={"階層"}
              indicator={false}
              icon={
                <Icon>
                  <HierarchyViewIcon />
                </Icon>
              }
              cursor={"pointer"}
            />
          </VStack>
        ) : (
          <HStack align={"stretch"} gap={2}>
            <RadioCardItem
              value={"scatterAll"}
              label={"全体"}
              indicator={false}
              icon={
                <Icon>
                  <AllViewIcon />
                </Icon>
              }
              cursor={"pointer"}
            />
            <RadioCardItem
              value={"scatterDensity"}
              label={"濃い意見"}
              indicator={false}
              icon={
                <Icon>
                  <DenseViewIcon />
                </Icon>
              }
              cursor={"pointer"}
              disabled={!isDenseGroupEnabled}
              disabledReason={"この設定条件では抽出できませんでした"}
            />
            <RadioCardItem
              value={"treemap"}
              label={"階層"}
              indicator={false}
              icon={
                <Icon>
                  <HierarchyViewIcon />
                </Icon>
              }
              cursor={"pointer"}
            />
          </HStack>
        )}
      </RadioCardRoot>
      <HStack>
        <Tooltip content={"表示設定"} openDelay={0} closeDelay={0}>
          <Button
            onClick={onClickDensitySetting}
            variant={"outline"}
            h={"50px"}
          >
            <Icon>
              <CogIcon />
            </Icon>
          </Button>
        </Tooltip>
        <Tooltip content={"全画面表示"} openDelay={0} closeDelay={0}>
          <Button onClick={onClickFullscreen} variant={"outline"} h={"50px"}>
            <Icon>
              <FullscreenIcon />
            </Icon>
          </Button>
        </Tooltip>
      </HStack>
      <HStack>
        <Tooltip content={"表示設定"} openDelay={0} closeDelay={0}>
          <Button
            onClick={onClickDensitySetting}
            variant={"outline"}
            h={"50px"}
          >
            <Icon>
              <CogIcon />
            </Icon>
          </Button>
        </Tooltip>
        <Tooltip content={"全画面表示"} openDelay={0} closeDelay={0}>
          <Button onClick={onClickFullscreen} variant={"outline"} h={"50px"}>
            <Icon>
              <FullscreenIcon />
            </Icon>
          </Button>
        </Tooltip>
      </HStack>
    </HStack>
  );
}
