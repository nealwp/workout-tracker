import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import { WorkoutProvider } from "../context/WorkoutContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === "dark" ? "dark" : "light"}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <WorkoutProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#0a0a0a" },
              headerTintColor: "#ffffff",
              contentStyle: { backgroundColor: "#0a0a0a" },
            }}
          />
        </WorkoutProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
