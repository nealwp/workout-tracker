import { useState } from "react";
import { useRouter } from "expo-router";
import { Button, H1, H2, ScrollView, Separator, XStack, YStack } from "tamagui";
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
            <Separator borderColor="$gray6" />
            {completedExercises.map((exercise) => (
              <XStack
                key={exercise.id}
                justify="space-between"
                items="center"
                py="$3"
                px="$4"
                bg="$gray4"
                rounded="$4"
              >
                <YStack gap="$1">
                  <H2 color="$color" fontSize={14} fontWeight="600">
                    {exercise.name}
                  </H2>
                  <H2 color="$gray10" fontSize={12}>
                    {exercise.muscleGroup}
                  </H2>
                </YStack>
                <H2 color="$gray10" fontSize={12}>
                  {exercise.sets.length} sets
                </H2>
              </XStack>
            ))}
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
