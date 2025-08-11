import { Text } from "@chakra-ui/react";

type NumberDisplayProps = {
  value: number;
  textStyle?: string;
  textAlign?: "start" | "end" | "left" | "right" | "center" | "justify" | "match-parent";
};

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${Math.floor(value / 1000000)}M`;
  }
  return value.toString();
}

export function NumberDisplay({ value, textStyle = "body/md/bold", textAlign = "center" }: NumberDisplayProps) {
  return (
    <Text textStyle={textStyle} textAlign={textAlign}>
      {formatNumber(value)}
    </Text>
  );
}
