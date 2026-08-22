import React, { ReactNode } from "react";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../../tamagui.config";

export function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      {children}
    </TamaguiProvider>
  );
}
