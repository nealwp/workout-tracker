import { useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter } from "expo-router";
import { Button, Paragraph, TamaguiProvider, XStack, YStack, AnimatePresence } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { tamaguiConfig, DARK_BACKGROUND } from "../tamagui.config";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { WorkoutProvider } from "../context/WorkoutContext";

if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../lib/googleSignIn");
}

function TopBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <XStack
      bg="$gray4"
      py="$2"
      px="$4"
      justify="space-between"
      items="center"
      borderBottomWidth={1}
      borderBottomColor="$gray7"
      style={{ zIndex: 100 }}
    >
      <Image
        source={
          colorScheme === "dark"
            ? require("../assets/images/irondog-logo-text-only-dark-mode.png")
            : require("../assets/images/irondog-logo-text-only-light-mode.png")
        }
        style={{ height: 30, width: 128 }}
        resizeMode="contain"
      />
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
                color="$gray11"
                borderBottomWidth={1}
                borderBottomColor="$gray6"
              >
                {user.name}
              </Paragraph>
              {(["Stats", "Settings"] as const).map((label) => (
                <Button
                  key={label}
                  chromeless
                  onPress={() => setOpen(false)}
                  px="$4"
                  py="$3"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Button.Text color="$gray12" fontSize={14}>
                    {label}
                  </Button.Text>
                </Button>
              ))}
              <Button
                chromeless
                onPress={() => { setOpen(false); router.push("/history"); }}
                px="$4"
                py="$3"
                style={{ justifyContent: "flex-start" }}
              >
                <Button.Text color="$gray12" fontSize={14}>
                  History
                </Button.Text>
              </Button>
              <Button
                chromeless
                onPress={() => { setOpen(false); signOut(); }}
                px="$4"
                py="$3"
                style={{ justifyContent: "flex-start" }}
                borderTopWidth={1}
                borderTopColor="$gray6"
              >
                <Button.Text color="$red11" fontSize={14}>
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
  const location = usePathname();

  return (
    <XStack
      bg="$gray4"
      py="$3"
      px="$4"
      justify="center"
      items="center"
      gap="$12"
      borderTopWidth={1}
      borderTopColor="$gray7"
    >
      <Pressable onPress={() => router.push("/")}>
        <Image
          source={require("../assets/images/irondog-logo-no-text.png")}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      </Pressable>
      <Pressable onPress={() => router.push("/history")}>
        <Ionicons
          name="list"
          size={40}
          color={location === "/history" ? "#ff4444" : "#999"}
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
              contentStyle: { backgroundColor: colorScheme === "dark" ? DARK_BACKGROUND : "#f7f7f7" },
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
