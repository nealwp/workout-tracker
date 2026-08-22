import { useState } from "react";
import { ActivityIndicator, Image, Pressable, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { Button, Paragraph, TamaguiProvider, XStack, YStack, AnimatePresence } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { WorkoutProvider } from "../context/WorkoutContext";
import "../lib/googleSignIn";

function TopBar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <XStack
      bg="$gray4"
      py="$2"
      px="$4"
      justify="flex-end"
      items="center"
      borderBottomWidth={1}
      borderBottomColor="$gray6"
      style={{ zIndex: 100 }}
    >
      <YStack position="relative">
        <Button
          chromeless
          onPress={() => setOpen(!open)}
          p={0}
          bg="transparent"
          hoverStyle={{ bg: "transparent" }}
          pressStyle={{ bg: "transparent", opacity: 0.7 }}
        >
          <Image
            source={user.avatarUrl ? { uri: user.avatarUrl } : undefined}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#555",
            }}
          />
        </Button>

        <AnimatePresence>
          {open && (
            <YStack
              key="menu"
              position="absolute"
              style={{ top: 44, right: 0, minWidth: 180 }}
              bg="$gray4"
              rounded="$4"
              overflow="hidden"
              elevation={4}
              enterStyle={{ opacity: 0, y: -8 }}
              exitStyle={{ opacity: 0, y: -8 }}
            >
              <Paragraph
                px="$4"
                py="$3"
                fontSize={13}
                color="$gray10"
                borderBottomWidth={1}
                borderBottomColor="$gray6"
              >
                {user.name}
              </Paragraph>
              {["History", "Stats", "Settings"].map((label) => (
                <Button
                  key={label}
                  chromeless
                  onPress={() => setOpen(false)}
                  px="$4"
                  py="$3"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Button.Text color="white" fontSize={14}>
                    {label}
                  </Button.Text>
                </Button>
              ))}
              <Button
                chromeless
                onPress={() => { setOpen(false); signOut(); }}
                px="$4"
                py="$3"
                style={{ justifyContent: "flex-start" }}
                borderTopWidth={1}
                borderTopColor="$gray6"
              >
                <Button.Text color="$red10" fontSize={14}>
                  Sign Out
                </Button.Text>
              </Button>
            </YStack>
          )}
        </AnimatePresence>
      </YStack>
    </XStack>
  );
}

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
      <Pressable onPress={() => router.push("/")}>
        <Image
          source={require("../assets/images/irondog-logo-no-text.png")}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      </Pressable>
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
        {user && <TopBar />}
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
