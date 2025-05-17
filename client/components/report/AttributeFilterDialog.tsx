import { Checkbox } from "@/components/ui/checkbox";
import { DialogBody, DialogContent, DialogFooter, DialogRoot } from "@/components/ui/dialog";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

type AttributeFilters = Record<string, string[]>;

type Props = {
  onClose: () => void;
  onApplyFilters: (filters: AttributeFilters) => void;
  availableAttributes: Record<string, string[]>;
  currentFilters: AttributeFilters;
};

export function AttributeFilterDialog({
  onClose,
  onApplyFilters,
  availableAttributes,
  currentFilters,
}: Props) {
  const [filters, setFilters] = useState<AttributeFilters>(currentFilters);

  function handleCheckboxChange(attribute: string, value: string) {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[attribute]) {
        newFilters[attribute] = [];
      }
      
      if (newFilters[attribute].includes(value)) {
        // Remove the value if already selected
        newFilters[attribute] = newFilters[attribute].filter(v => v !== value);
        // Clean up empty arrays
        if (newFilters[attribute].length === 0) {
          delete newFilters[attribute];
        }
      } else {
        // Add the value if not already selected
        newFilters[attribute] = [...newFilters[attribute], value];
      }
      
      return newFilters;
    });
  }

  function onApply() {
    onApplyFilters(filters);
    onClose();
  }

  function handleClearFilters() {
    setFilters({});
  }

  return (
    <DialogRoot lazyMount open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogBody>
          <Box mb={6} mt={4}>
            <Text fontWeight="bold" mb={2} fontSize="md">
              属性フィルター
            </Text>
            <Text fontSize="sm" mb={5}>
              表示する意見グループを属性で絞り込みます。
            </Text>
            
            {Object.keys(availableAttributes).length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                利用できる属性情報がありません。CSVファイルをアップロードする際に、属性列を選択してください。
              </Text>
            ) : (
              Object.entries(availableAttributes).map(([attribute, values]) => (
                <Box key={attribute} mb={4}>
                  <Heading size="sm" mb={2}>
                    {attribute}
                  </Heading>
                  <Box pl={2}>
                    {values.map((value) => (
                      <Box key={`${attribute}-${value}`} display="flex" alignItems="center" mb={1}>
                        <Checkbox 
                          isChecked={filters[attribute]?.includes(value) || false}
                          onChange={() => handleCheckboxChange(attribute, value)}
                        >
                          {value || '(空)'}
                        </Checkbox>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </DialogBody>
        <DialogFooter justifyContent="space-between">
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            すべてクリア
          </Button>
          <Button onClick={onApply}>設定を適用</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
