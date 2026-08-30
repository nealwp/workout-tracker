import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Collapsible, H1, H2, Input, ScrollView, YStack } from "tamagui";
import type { LastExercisePerformance } from "@irondog/shared";
import { SetsTable } from "@/components/SetsTable";
import { EXERCISES } from "@/data/exercises";
import { getLastExercisePerformance } from "@/lib/api/client";
import { useWorkout } from "../../context/WorkoutContext";

interface Set {
  id: number;
  weight: number;
  reps: number;
  failure: boolean;
}

const REST_SECONDS = 60;

const formatRestTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function ExerciseTracker() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { finishExercise } = useWorkout();

  const exercise = EXERCISES.find((e) => e.id === exerciseId);

  const [sets, setSets] = useState<Set[]>([]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [failure, setFailure] = useState(false);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [lastPerformance, setLastPerformance] = useState<LastExercisePerformance | null>(null);
  const [lastPerformanceOpen, setLastPerformanceOpen] = useState(false);

  useEffect(() => {
    if (restRemaining === null || restRemaining <= 0) return;
    const id = setTimeout(() => {
      setRestRemaining((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearTimeout(id);
  }, [restRemaining]);

  useEffect(() => {
    if (!exerciseId) return;
    let cancelled = false;

    getLastExercisePerformance(exerciseId)
      .then((result) => {
        if (!cancelled) setLastPerformance(result);
      })
      .catch(() => {
        if (!cancelled) setLastPerformance(null);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const handleStartRest = () => {
    setRestRemaining(REST_SECONDS);
  };

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
        <Button
          onPress={() => router.back()}
          bg="$gray4"
          borderWidth={1}
          borderColor="$gray6"
          px="$4"
          py="$2"
          rounded="$4"
          pressStyle={{ opacity: 0.8 }}
          style={{ alignSelf: "flex-end" }}
        >
          <Button.Text color="$gray12" fontSize={14} fontWeight="600">
            Cancel
          </Button.Text>
        </Button>

        <YStack gap="$2">
          <H1 color="$color" fontSize={24} fontWeight="bold">
            {exercise.name}
          </H1>
          <H2 color="$gray11" fontSize={14}>
            Set {currentSetNumber}
          </H2>
        </YStack>

        {lastPerformance && (
          <Collapsible open={lastPerformanceOpen} onOpenChange={setLastPerformanceOpen}>
            <Collapsible.Trigger asChild>
              <Button
                bg="$red10"
                py="$3"
                px="$4"
                rounded="$4"
                justify="space-between"
                items="center"
                pressStyle={{ bg: "$red9", opacity: 0.8 }}
              >
                <Button.Text color="white" fontSize={14} fontWeight="600">
                  LAST TIME — {new Date(lastPerformance.date).toLocaleDateString()}
                </Button.Text>
                <MaterialIcons
                  name={lastPerformanceOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={20}
                  color="white"
                />
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <YStack mt="$2">
                <SetsTable sets={lastPerformance.exercise.sets} />
              </YStack>
            </Collapsible.Content>
          </Collapsible>
        )}

        <YStack gap="$3" bg="$gray4" p="$4" rounded="$4">
          <YStack gap="$2">
            <H2 color="$color" fontSize={12} fontWeight="600">
              WEIGHT (lbs)
            </H2>
            <Input
              bg="$gray5"
              color="$color"
              p="$4"
              rounded="$4"
              fontSize={24}
              fontWeight="bold"
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="$placeholderColor"
              value={weight}
              onChangeText={setWeight}
            />
          </YStack>

          <YStack gap="$2">
            <H2 color="$color" fontSize={12} fontWeight="600">
              REPS
            </H2>
            <Input
              bg="$gray5"
              color="$color"
              p="$4"
              rounded="$4"
              fontSize={24}
              fontWeight="bold"
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="$placeholderColor"
              value={reps}
              onChangeText={setReps}
            />
          </YStack>

          <Button
            onPress={() => setFailure(!failure)}
            bg={failure ? "$red10" : "$gray5"}
            pressStyle={{ opacity: 0.8 }}
          >
            <Button.Text color={failure ? "white" : "$gray12"} fontSize={14} fontWeight="600">
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

        <Button
          onPress={handleStartRest}
          bg="$gray4"
          borderWidth={1}
          borderColor={restRemaining === null || restRemaining === 0 ? "$gray6" : "$red9"}
          px="$4"
          py="$3"
          rounded="$4"
          pressStyle={{ opacity: 0.8 }}
        >
          <Button.Text
            color={restRemaining === null || restRemaining === 0 ? "$gray12" : "$red10"}
            fontSize={16}
            fontWeight="600"
          >
            {restRemaining === null
              ? `REST ${formatRestTime(REST_SECONDS)}`
              : restRemaining === 0
                ? "REST DONE ✓"
                : `REST ${formatRestTime(restRemaining)}`}
          </Button.Text>
        </Button>

        {sets.length > 0 && (
          <YStack gap="$2">
            <H2 color="$color" fontSize={14} fontWeight="600">
              COMPLETED SETS
            </H2>
            <SetsTable sets={sets} />
          </YStack>
        )}

        <Button
          onPress={handleFinishExercise}
          bg="$red10"
          pressStyle={{ bg: "$red9", opacity: 0.8 }}
        >
          <Button.Text color="white" fontSize={16} fontWeight="bold">
            FINISH EXERCISE
          </Button.Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}
