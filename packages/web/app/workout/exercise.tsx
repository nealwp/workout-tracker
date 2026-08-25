import { useState } from "react";
import { TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, H1, H2, Separator, ScrollView, XStack, YStack } from "tamagui";
import { EXERCISES } from "@/data/exercises";
import { useWorkout } from "../../context/WorkoutContext";

interface Set {
  id: number;
  weight: number;
  reps: number;
  failure: boolean;
}

export default function ExerciseTracker() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { finishExercise } = useWorkout();

  const exercise = EXERCISES.find((e) => e.id === exerciseId);

  const [sets, setSets] = useState<Set[]>([]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [failure, setFailure] = useState(false);

  const currentSetNumber = sets.length + 1;

  const handleLogSet = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
      return;
    }

    const newSet: Set = {
      id: currentSetNumber,
      weight: weightNum,
      reps: repsNum,
      failure,
    };

    setSets([...sets, newSet]);
    setWeight("");
    setReps("");
    setFailure(false);
  };

  const handleFinishExercise = async () => {
    let finalSets = [...sets];

    if (weight && reps) {
      const weightNum = parseFloat(weight);
      const repsNum = parseInt(reps, 10);

      if (!isNaN(weightNum) && !isNaN(repsNum) && weightNum > 0 && repsNum > 0) {
        finalSets = [
          ...finalSets,
          {
            id: finalSets.length + 1,
            weight: weightNum,
            reps: repsNum,
            failure,
          },
        ];
      }
    }

    if (exerciseId && finalSets.length > 0) {
      await finishExercise(exerciseId, finalSets);
    }

    router.back();
  };

  if (!exercise) {
    return (
      <YStack flex={1} justify="center" items="center" p="$4" bg="$background">
        <H1 color="$color">Exercise not found</H1>
      </YStack>
    );
  }

  return (
    <ScrollView flex={1} bg="$background">
      <YStack p="$4" gap="$4">
        <YStack gap="$2">
          <H1 color="$color" fontSize={24} fontWeight="bold">
            {exercise.name}
          </H1>
          <H2 color="$gray10" fontSize={14}>
            Set {currentSetNumber}
          </H2>
        </YStack>

        <YStack gap="$3" bg="$gray4" p="$4" rounded="$4">
          <YStack gap="$2">
            <H2 color="$color" fontSize={12} fontWeight="600">
              WEIGHT (lbs)
            </H2>
            <TextInput
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                padding: 16,
                borderRadius: 8,
                fontSize: 24,
                fontWeight: "bold",
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#666"
              value={weight}
              onChangeText={setWeight}
            />
          </YStack>

          <YStack gap="$2">
            <H2 color="$color" fontSize={12} fontWeight="600">
              REPS
            </H2>
            <TextInput
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                padding: 16,
                borderRadius: 8,
                fontSize: 24,
                fontWeight: "bold",
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#666"
              value={reps}
              onChangeText={setReps}
            />
          </YStack>

          <Button
            onPress={() => setFailure(!failure)}
            bg={failure ? "$red10" : "$gray5"}
            pressStyle={{ opacity: 0.8 }}
          >
            <Button.Text color="white" fontSize={14} fontWeight="600">
              {failure ? "FAILURE ✓" : "TAKEN TO FAILURE?"}
            </Button.Text>
          </Button>
        </YStack>

        <Button
          onPress={handleLogSet}
          bg="$green10"
          pressStyle={{ bg: "$green9", opacity: 0.8 }}
          disabled={!weight || !reps}
          opacity={!weight || !reps ? 0.5 : 1}
        >
          <Button.Text color="white" fontSize={16} fontWeight="bold">
            LOG SET
          </Button.Text>
        </Button>

        {sets.length > 0 && (
          <YStack gap="$2">
            <H2 color="$color" fontSize={14} fontWeight="600">
              COMPLETED SETS
            </H2>
            <Separator borderColor="$gray6" />
            {sets.map((set) => (
              <XStack
                key={set.id}
                justify="space-between"
                items="center"
                py="$3"
                px="$4"
                bg="$gray4"
                rounded="$4"
              >
                <H2 color="$color" fontSize={14} fontWeight="600">
                  Set {set.id}
                </H2>
                <XStack gap="$4" items="center">
                  <H2 color="$color" fontSize={16} fontWeight="bold">
                    {set.weight} lbs
                  </H2>
                  <H2 color="$gray10" fontSize={14}>
                    × {set.reps}
                  </H2>
                  {set.failure && (
                    <H2 color="$red10" fontSize={12} fontWeight="600">
                      FAIL
                    </H2>
                  )}
                </XStack>
              </XStack>
            ))}
          </YStack>
        )}

        <Button
          onPress={handleFinishExercise}
          bg="$gray5"
          pressStyle={{ bg: "$gray6", opacity: 0.8 }}
        >
          <Button.Text color="white" fontSize={16} fontWeight="bold">
            FINISH EXERCISE
          </Button.Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}
