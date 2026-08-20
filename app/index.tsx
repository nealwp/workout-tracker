import { useRouter } from "expo-router";
import { Button, H1, Paragraph, YStack } from "tamagui";

export default function Index() {
  const router = useRouter();

  return (
    <YStack flex={1} justify="center" items="center" p="$4" bg="$background">
      <H1 color="$color" fontSize={32} fontWeight="bold" letterSpacing={2}>
        WORKOUT TRACKER
      </H1>
      <Paragraph color="$gray10" fontSize={14} letterSpacing={1} mb={64}>
        Hypertrophy & Progressive Overload
      </Paragraph>

      <Button
        onPress={() => router.push("/workout/select-exercise")}
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
