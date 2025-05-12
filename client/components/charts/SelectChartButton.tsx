import { Tooltip } from "@/components/ui/tooltip";
import { Button, HStack, Icon, Box, useBreakpointValue, SegmentGroup } from "@chakra-ui/react";
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
  
  const items = [
    {
      value: "scatterAll",
      label: (
        <HStack>
          <Icon as={AllViewIcon} />
          <Box>全体</Box>
        </HStack>
      ),
      isDisabled: false,
    },
    {
      value: "scatterDensity",
      label: (
        <HStack>
          <Icon as={DenseViewIcon} />
          <Box>濃い意見</Box>
        </HStack>
      ),
      isDisabled: !isDenseGroupEnabled,
      tooltip: !isDenseGroupEnabled ? "この設定条件では抽出できませんでした" : undefined,
    },
    {
      value: "treemap",
      label: (
        <HStack>
          <Icon as={HierarchyViewIcon} />
          <Box>階層</Box>
        </HStack>
      ),
      isDisabled: false,
    },
  ];
  
  const handleChange = (event: React.FormEvent<HTMLDivElement>) => {
    const value = (event.target as HTMLInputElement).value;
    onChange(value);
  };

  return (
    <HStack
      w={"100%"}
      maxW={"1200px"}
      mx={"auto"}
      justify={"space-between"}
      align={"center"}
      mb={2}
    >
      <Box w="100%" display="flex" justifyContent="center">
        <SegmentGroup.Root 
          value={selected}
          onChange={handleChange}
          orientation={isVertical ? "vertical" : "horizontal"}
          size="md"
          colorScheme="gray"
          bg="gray.200"
          _selected={{ bg: "gray.100", color: "gray.500" }}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={items} />
        </SegmentGroup.Root>
      </Box>
      
      <HStack>
        <Tooltip content={"表示設定"} openDelay={0} closeDelay={0}>
          <Button
            onClick={onClickDensitySetting}
            variant={"outline"}
            h={"40px"}
          >
            <Icon as={CogIcon} />
          </Button>
        </Tooltip>
        <Tooltip content={"全画面表示"} openDelay={0} closeDelay={0}>
          <Button onClick={onClickFullscreen} variant={"outline"} h={"40px"}>
            <Icon as={FullscreenIcon} />
          </Button>
        </Tooltip>
      </HStack>
    </HStack>
  );
}
