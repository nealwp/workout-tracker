import { GoogleSignin } from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: ["profile", "email"],
});
