import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORKOUT TRACKER</Text>
      <Text style={styles.subtitle}>Hypertrophy & Progressive Overload</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => router.push("/workout/select-exercise")}
      >
        <Text style={styles.buttonText}>LFG</Text>
      </Pressable>

      <Text style={styles.hint}>Tap to start today&apos;s workout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 64,
  },
  button: {
    backgroundColor: "#e63946",
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#e63946",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: "#c1121f",
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  hint: {
    marginTop: 32,
    fontSize: 14,
    color: "#666666",
  },
});
