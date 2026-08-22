import { useState } from "react";
import { useRouter } from "expo-router";
import { Button, H1, H2, ScrollView, XStack, YStack } from "tamagui";
import { EXERCISES, MUSCLE_GROUPS, type MuscleGroup } from "@/data/exercises";
import { useWorkout } from "../../context/WorkoutContext";

export default function SelectExercise() {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);
  const router = useRouter();
  const { completedExercises } = useWorkout();

  const filteredExercises = selectedGroup
    ? EXERCISES.filter((e) => e.muscleGroup === selectedGroup)
    : [];

  return (
    <ScrollView flex={1} bg="$background">
      <YStack p="$4" gap="$4">
        {completedExercises.length > 0 && (
          <YStack gap="$2">
            <H1 color="$color" fontSize={20} fontWeight="bold">
              Completed Exercises
            </H1>
            <YStack bg="$gray4" rounded="$4" overflow="hidden">
              <XStack
                py="$2"
                px="$4"
                borderBottomWidth={1}
                borderBottomColor="$gray6"
              >
                <H2 color="$gray10" fontSize={11} fontWeight="600" flex={2}>
                  EXERCISE
                </H2>
                <H2 color="$gray10" fontSize={11} fontWeight="600" flex={2}>
                  MUSCLE
                </H2>
                <H2 color="$gray10" fontSize={11} fontWeight="600" flex={1}>
                  SETS
                </H2>
                <H2 color="$gray10" fontSize={11} fontWeight="600" flex={2}>
                  BEST SET
                </H2>
              </XStack>
              {completedExercises.map((exercise) => {
                const bestSet = exercise.sets.reduce(
                  (best, s) => (!best || s.weight * s.reps > best.weight * best.reps ? s : best),
                  null as typeof exercise.sets[0] | null
                );
                return (
                  <XStack
                    key={exercise.id}
                    py="$2"
                    px="$4"
                    items="center"
                    borderBottomWidth={1}
                    borderBottomColor="$gray5"
                  >
                    <H2 color="$color" fontSize={13} fontWeight="600" flex={2}>
                      {exercise.name}
                    </H2>
                    <H2 color="$gray10" fontSize={12} flex={2}>
                      {exercise.muscleGroup}
                    </H2>
                    <H2 color="$color" fontSize={13} flex={1}>
                      {exercise.sets.length}
                    </H2>
                    <H2 color="$color" fontSize={13} flex={2}>
                      {bestSet ? `${bestSet.weight}×${bestSet.reps}` : "—"}
                    </H2>
                  </XStack>
                );
              })}
            </YStack>
          </YStack>
        )}

        <H1 color="$color" fontSize={20} fontWeight="bold">
          Choose Muscle Group
        </H1>

        <XStack flexWrap="wrap" gap="$3">
          {MUSCLE_GROUPS.map((group) => (
            <Button
              key={group.id}
              onPress={() => setSelectedGroup(group.id)}
              bg={selectedGroup === group.id ? "$red10" : "$gray5"}
              borderWidth={2}
              borderColor={selectedGroup === group.id ? "$red10" : "$gray6"}
              py="$4"
              px="$5"
              rounded="$4"
              pressStyle={{ opacity: 0.8 }}
            >
              <Button.Text color="white" fontSize={16} fontWeight="600">
                {group.name}
              </Button.Text>
            </Button>
          ))}
        </XStack>

        {selectedGroup && (
          <YStack gap="$3">
            <H1 color="$color" fontSize={20} fontWeight="bold">
              Choose Exercise
            </H1>
            <YStack gap="$2">
              {filteredExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  onPress={() =>
                    router.push({
                      pathname: "/workout/exercise",
                      params: { exerciseId: exercise.id },
                    })
                  }
                  bg="$gray4"
                  borderWidth={1}
                  borderColor="$gray6"
                  py="$4"
                  px="$5"
                  rounded="$4"
                  pressStyle={{ opacity: 0.8 }}
                  justify="flex-start"
                >
                  <Button.Text color="white" fontSize={16}>
                    {exercise.name}
                  </Button.Text>
                </Button>
              ))}
            </YStack>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
