import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";

export const DARK_BACKGROUND = "#1a1a1a";
export const LIGHT_FOREGROUND = "#1a1a1a";

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      color: LIGHT_FOREGROUND,
      colorHover: LIGHT_FOREGROUND,
      colorPress: LIGHT_FOREGROUND,
      colorFocus: LIGHT_FOREGROUND,
      color12: LIGHT_FOREGROUND,
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: DARK_BACKGROUND,
      backgroundHover: "#1e1e1e",
      backgroundFocus: "#1e1e1e",
      backgroundPress: "#151515",
      backgroundActive: "#151515",
    },
    dark_accent: {
      ...defaultConfig.themes.dark_accent,
      accent12: LIGHT_FOREGROUND,
    },
  },
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
