import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100%{
    transform: rotate(360deg);
  }
`;

export function Processing() {
  const size = "24px";

  return (
    <Box width={size} height={size} borderRadius="full" position="relative">
      <Box
        position="absolute"
        width="full"
        height="full"
        borderRadius="full"
        border={`calc(${size} / 10) solid transparent`}
        borderTopColor="font.processing"
        animation={`${spin} 1s infinite`}
      />
      <Box
        position="absolute"
        width="full"
        height="full"
        borderRadius="full"
        border={`calc(${size} / 10) solid transparent`}
        borderTopColor="font.processing"
        animation={`${spin} 1s infinite alternate`}
      />
    </Box>
  );
}
