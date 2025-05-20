import { Checkbox } from "@/components/ui/checkbox";
import { DialogBody, DialogContent, DialogFooter, DialogRoot } from "@/components/ui/dialog";
import { Box, Button, Flex, Heading, Input, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";

export type AttributeFilters = Record<string, string[]>;
type NumericRange = [number, number];
type NumericRangeFilters = Record<string, NumericRange>;
type AttributeTypes = Record<string, "numeric" | "categorical">;

type Props = {
  onClose: () => void;
  onApplyFilters: (
    filters: AttributeFilters,
    numericRanges: NumericRangeFilters,
    includeEmpty: Record<string, boolean>,
    enabledRanges: Record<string, boolean>,
  ) => void;
  samples: Array<Record<string, string>>;
  initialFilters?: AttributeFilters;
  initialNumericRanges?: NumericRangeFilters;
  initialEnabledRanges?: Record<string, boolean>;
  initialIncludeEmptyValues?: Record<string, boolean>;
};

export function AttributeFilterDialog({
  onClose,
  onApplyFilters,
  samples,
  initialFilters = {},
  initialNumericRanges = {},
  initialEnabledRanges = {},
  initialIncludeEmptyValues = {},
}: Props) {
  // 属性名リスト
  const attributeNames = useMemo(() => (samples[0] ? Object.keys(samples[0]) : []), [samples]);

  // 属性ごとの値リスト
  const availableAttributes = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const attr of attributeNames) {
      result[attr] = Array.from(new Set(samples.map((s) => s[attr] ?? "")))
        .filter((v) => v !== "")
        .sort((a, b) => a.localeCompare(b, "ja"));
    }
    return result;
  }, [samples, attributeNames]);

  // 属性型判定
  const attributeTypes: AttributeTypes = useMemo(() => {
    const typeMap: AttributeTypes = {};
    for (const attr of attributeNames) {
      const values = availableAttributes[attr];
      const isNumeric = values.filter((v) => v.trim() !== "").every((v) => !Number.isNaN(Number(v)));
      typeMap[attr] = isNumeric && values.length > 0 ? "numeric" : "categorical";
    }
    return typeMap;
  }, [attributeNames, availableAttributes]);

  // 数値属性のmin/max
  const numericRangesAll = useMemo(() => {
    const ranges: NumericRangeFilters = {};
    for (const attr of attributeNames) {
      if (attributeTypes[attr] === "numeric") {
        const nums = availableAttributes[attr].filter((v) => v.trim() !== "").map(Number);
        ranges[attr] = nums.length > 0 ? [Math.min(...nums), Math.max(...nums)] : [0, 0];
      }
    }
    return ranges;
  }, [attributeNames, attributeTypes, availableAttributes]);

  // --- 状態 ---
  const [categoricalFilters, setCategoricalFilters] = useState<AttributeFilters>(initialFilters);
  const [numericRanges, setNumericRanges] = useState<NumericRangeFilters>(
    Object.keys(initialNumericRanges).length > 0 ? initialNumericRanges : numericRangesAll,
  );
  const [enabledRanges, setEnabledRanges] = useState<Record<string, boolean>>(initialEnabledRanges);
  const [includeEmptyValues, setIncludeEmptyValues] = useState<Record<string, boolean>>(initialIncludeEmptyValues);

  // --- ハンドラ ---
  const handleCheckboxChange = useCallback((attr: string, value: string) => {
    setCategoricalFilters((prev) => {
      const arr = prev[attr] ?? [];
      const nextArr = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      const next = { ...prev };
      if (nextArr.length === 0) delete next[attr];
      else next[attr] = nextArr;
      return next;
    });
  }, []);

  const handleRangeChange = useCallback(
    (attr: string, idx: 0 | 1, value: number) => {
      setNumericRanges((prev) => {
        const [min, max] = prev[attr] ?? numericRangesAll[attr] ?? [0, 0];
        const next: NumericRange = idx === 0 ? [Math.min(value, max), max] : [min, Math.max(value, min)];
        return { ...prev, [attr]: next };
      });
    },
    [numericRangesAll],
  );

  const toggleRangeFilter = useCallback((attr: string) => {
    setEnabledRanges((prev) => ({ ...prev, [attr]: !prev[attr] }));
  }, []);

  const handleIncludeEmptyToggle = useCallback((attr: string) => {
    setIncludeEmptyValues((prev) => ({ ...prev, [attr]: !prev[attr] }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setCategoricalFilters({});
    setNumericRanges(numericRangesAll);
    setEnabledRanges({});
    setIncludeEmptyValues({});
  }, [numericRangesAll]);

  // --- 適用 ---
  const onApply = useCallback(() => {
    onApplyFilters(categoricalFilters, numericRanges, includeEmptyValues, enabledRanges);
    onClose();
  }, [categoricalFilters, numericRanges, includeEmptyValues, enabledRanges, onApplyFilters, onClose]);

  // --- UI ---
  return (
    <DialogRoot lazyMount open onOpenChange={onClose}>
      <DialogContent width="80vw" maxWidth="1200px">
        <DialogBody>
          <Box mb={6} mt={4}>
            <Heading as="h3" size="md" mb={2}>
              属性フィルター
            </Heading>
            <Text fontSize="sm" mb={5} color="gray.600">
              表示する意見グループを属性で絞り込みます。各項目のフィルタはAND結合されます。
            </Text>
            {attributeNames.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                利用できる属性情報がありません。CSVファイルをアップロードする際に、属性列を選択してください。
              </Text>
            ) : (
              attributeNames.map((attr) => {
                const values = availableAttributes[attr];
                const isNumeric = attributeTypes[attr] === "numeric";
                return (
                  <Box key={attr} mb={4}>
                    <Flex align="center" mb={2}>
                      <Heading size="sm" mb={0} mr={3}>
                        {attr}
                      </Heading>
                      {isNumeric && values.length > 0 && (
                        <Checkbox checked={!!enabledRanges[attr]} onChange={() => toggleRangeFilter(attr)}>
                          フィルター有効化
                        </Checkbox>
                      )}
                    </Flex>
                    {isNumeric && values.length > 0 ? (
                      <Box pl={2} pr={4} borderWidth={1} borderRadius="md" p={2}>
                        <Flex align="center">
                          <Checkbox
                            checked={!!includeEmptyValues[attr]}
                            onChange={() => handleIncludeEmptyToggle(attr)}
                            disabled={!enabledRanges[attr]}
                            mr={4}
                          >
                            空の値を含める
                          </Checkbox>
                          <Text fontSize="xs" width="60px" textAlign="right" mr={2}>
                            最小: {numericRangesAll[attr]?.[0] ?? "-"}
                          </Text>
                          <Input
                            type="number"
                            value={numericRanges[attr]?.[0] ?? ""}
                            onChange={(e) => handleRangeChange(attr, 0, Number(e.target.value))}
                            size="sm"
                            width="100px"
                            disabled={!enabledRanges[attr]}
                          />
                          <Text mx={2}>～</Text>
                          <Input
                            type="number"
                            value={numericRanges[attr]?.[1] ?? ""}
                            onChange={(e) => handleRangeChange(attr, 1, Number(e.target.value))}
                            size="sm"
                            width="100px"
                            disabled={!enabledRanges[attr]}
                          />
                          <Text fontSize="xs" width="60px" textAlign="left" ml={2}>
                            最大: {numericRangesAll[attr]?.[1] ?? "-"}
                          </Text>
                        </Flex>
                      </Box>
                    ) : (
                      <Box pl={2}>
                        <Wrap style={{ gap: "8px" }}>
                          {values.map((value) => (
                            <WrapItem key={`${attr}-${value}`} mb={2} mr={3}>
                              <Box
                                p={1}
                                px={2}
                                borderWidth={1}
                                borderRadius="md"
                                bg={categoricalFilters[attr]?.includes(value) ? "blue.50" : "transparent"}
                                _hover={{ bg: "gray.50" }}
                                cursor="pointer"
                                onClick={() => handleCheckboxChange(attr, value)}
                              >
                                <Checkbox
                                  checked={categoricalFilters[attr]?.includes(value) || false}
                                  onChange={() => handleCheckboxChange(attr, value)}
                                >
                                  {value || "(空)"}
                                </Checkbox>
                                <Text as="span" fontSize="xs" ml={1} color="gray.500">
                                  {samples.filter((s) => s[attr] === value).length}
                                </Text>
                              </Box>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </DialogBody>
        <DialogFooter justifyContent="space-between">
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            すべてクリア
          </Button>
          <Button onClick={onApply} colorScheme="blue">
            設定を適用
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
