import { createSystem, defaultConfig } from "@chakra-ui/react";
import { textStyles } from "./textStyle";

export const system = createSystem(defaultConfig, {
  theme: {
    textStyles,
  },
});
