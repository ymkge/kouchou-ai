import { createSystem, defaultConfig } from "@chakra-ui/react";
import { textStyles } from "./textStyle";
import { fonts } from "./fonts";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts,
    },
    textStyles,
  },
});
