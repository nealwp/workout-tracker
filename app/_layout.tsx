import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { Button, TamaguiProvider, YStack, XStack } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import { WorkoutProvider } from "../context/WorkoutContext";

function BottomBar() {
  const router = useRouter();

  return (
    <XStack
      bg="$gray4"
      py="$3"
      px="$4"
      justify="center"
      items="center"
      borderTopWidth={1}
      borderTopColor="$gray6"
    >
      <Button
        onPress={() => router.push("/")}
        bg="$gray5"
        pressStyle={{ bg: "$gray6", opacity: 0.8 }}
        px="$6"
      >
        <Button.Text color="white" fontSize={14} fontWeight="600">
          HOME
        </Button.Text>
      </Button>
    </XStack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === "dark" ? "dark" : "light"}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <WorkoutProvider>
          <YStack flex={1} bg="$background">
            <YStack flex={1}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#0a0a0a" },
                }}
              />
            </YStack>
            <BottomBar />
          </YStack>
        </WorkoutProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
