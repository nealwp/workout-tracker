import { useState, useMemo } from "react";
import { ActivityIndicator, Image } from "react-native";
import { Fontisto } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { Button, H1, Paragraph, YStack } from "tamagui";
import { useWorkout } from "../context/WorkoutContext";
import { useAuth } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

function LoginView() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nonce = useMemo(() => Crypto.randomUUID(), []);

  const [, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri(),
      scopes: ["openid", "profile", "email"],
      responseType: "id_token",
      usePKCE: false,
      extraParams: { nonce },
    },
    DISCOVERY
  );

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        setLoading(false);
        return;
      }

      const idToken = result.params.id_token;
      if (!idToken) {
        throw new Error("No idToken received from Google");
      }

      await signIn(idToken);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} justify="center" items="center" p="$4" bg="$background">
      <Image
        source={require("../assets/images/irondog-logo.png")}
        style={{ width: 128, height: 128, borderRadius: 64, marginBottom: 16 }}
      />
      <Paragraph color="$gray10" fontSize={14} letterSpacing={1} mb={64}>
        Hypertrophy & Progressive Overload
      </Paragraph>

      {loading ? (
        <ActivityIndicator size="large" color="#ff4444" />
      ) : (
        <Button
          onPress={handleSignIn}
          bg="white"
          pressStyle={{ opacity: 0.8 }}
          px="$6"
          py="$4"
          rounded="$4"
          gap="$2"
        >
          <Fontisto name="google" size={20} color="#4285F4" />
          <Button.Text color="black" fontSize={16} fontWeight="600">
            Sign in with Google
          </Button.Text>
        </Button>
      )}

      {error && (
        <Paragraph color="$red10" fontSize={13} mt="$4" style={{ textAlign: "center" }}>
          {error}
        </Paragraph>
      )}
    </YStack>
  );
}

function HomeView() {
  const router = useRouter();
  const { startWorkout } = useWorkout();
  const { user } = useAuth();

  const handleStartWorkout = async () => {
    await startWorkout();
    router.push("/workout/select-exercise");
  };

  return (
    <YStack flex={1} justify="center" items="center" p="$4" bg="$background">
      <Image
        source={require("../assets/images/irondog-logo.png")}
        style={{ width: 128, height: 128, borderRadius: 64, marginBottom: 16 }}
      />
      {user && (
        <Paragraph color="$gray10" fontSize={16} mb="$2">
          Hi, {user.name}
        </Paragraph>
      )}
      <Paragraph color="$gray10" fontSize={14} letterSpacing={1} mb={64}>
        Hypertrophy & Progressive Overload
      </Paragraph>

      <Button
        onPress={handleStartWorkout}
        width={200}
        height={200}
        rounded={100}
        bg="$red10"
        pressStyle={{ bg: "$red9", scale: 0.95 }}
        elevation={8}
        shadowColor="$red10"
        shadowOffset={{ width: 0, height: 0 }}
        shadowOpacity={0.4}
        shadowRadius={20}
      >
        <H1 color="white" fontSize={48} fontWeight="bold" letterSpacing={4}>
          LFG
        </H1>
      </Button>

      <Paragraph color="$gray9" fontSize={14} mt={32}>
        Tap to start today&apos;s workout
      </Paragraph>
    </YStack>
  );
}

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" bg="$background">
        <ActivityIndicator size="large" color="#ff4444" />
      </YStack>
    );
  }

  if (!user) return <LoginView />;
  return <HomeView />;
}
