import { ActivityIndicator, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { Button, TamaguiProvider, YStack, XStack } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { WorkoutProvider } from "../context/WorkoutContext";
import "../lib/googleSignIn";

function BottomBar() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <XStack
      bg="$gray4"
      py="$3"
      px="$4"
      justify="space-between"
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
      <Button
        onPress={signOut}
        bg="$gray5"
        pressStyle={{ bg: "$gray6", opacity: 0.8 }}
        px="$6"
      >
        <Button.Text color="white" fontSize={14} fontWeight="600">
          SIGN OUT
        </Button.Text>
      </Button>
    </XStack>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" bg="$background">
        <ActivityIndicator size="large" color="#ff4444" />
      </YStack>
    );
  }

  return (
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
        {user && <BottomBar />}
      </YStack>
    </WorkoutProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === "dark" ? "dark" : "light"}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
