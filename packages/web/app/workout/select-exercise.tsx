import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { AnimatePresence, Button, H1, ScrollView, XStack, YStack, useTheme } from "tamagui";
import { ExercisesTable } from "@/components/ExercisesTable";
import { EXERCISES, MUSCLE_GROUPS, type MuscleGroup } from "@/data/exercises";
import { useWorkout } from "../../context/WorkoutContext";

export default function SelectExercise() {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const { completedExercises } = useWorkout();

  const filteredExercises = selectedGroup
    ? EXERCISES.filter((e) => e.muscleGroup === selectedGroup)
    : [];

  return (
    <ScrollView flex={1} bg="$background">
      <YStack p="$3" gap="$3">
        <H1 color="$color" fontSize={18} fontWeight="bold">
          Choose Muscle Group
        </H1>

        <XStack flexWrap="wrap" gap="$2">
          {MUSCLE_GROUPS.map((group) => (
            <Button
              key={group.id}
              onPress={() => setSelectedGroup(group.id)}
              bg={selectedGroup === group.id ? "$red10" : "$gray5"}
              borderWidth={2}
              borderColor={selectedGroup === group.id ? "$red10" : "$gray6"}
              py="$2.5"
              px="$4"
              rounded="$4"
              pressStyle={{ opacity: 0.8 }}
              flex={1}
              style={{ minWidth: "45%" }}
            >
              <Button.Text
                color={selectedGroup === group.id ? "white" : "$gray12"}
                fontSize={15}
                fontWeight="600"
                style={{ textAlign: "center" }}
              >
                {group.name}
              </Button.Text>
            </Button>
          ))}
        </XStack>

        {selectedGroup && (
          <YStack gap="$2">
            <H1 color="$color" fontSize={18} fontWeight="bold">
              Choose Exercise
            </H1>
            <YStack gap="$1.5">
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
                  py="$2.5"
                  px="$4"
                  rounded="$4"
                  pressStyle={{ opacity: 0.8 }}
                  justify="flex-start"
                >
                  <Button.Text color="$gray12" fontSize={15}>
                    {exercise.name}
                  </Button.Text>
                </Button>
              ))}
            </YStack>
          </YStack>
        )}

        {completedExercises.length > 0 && (
          <YStack gap="$1.5">
            <Button
              onPress={() => setCompletedExpanded(!completedExpanded)}
              bg="transparent"
              px="$0"
              py="$0"
              justify="space-between"
              items="center"
              pressStyle={{ opacity: 0.7 }}
            >
              <Button.Text color="$color" fontSize={18} fontWeight="bold">
                Completed Exercises
              </Button.Text>
              <MaterialIcons
                name={completedExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color={theme.gray11?.val ?? "#aaa"}
              />
            </Button>
            <AnimatePresence>
              {completedExpanded && (
                <YStack
                  key="completed-table"
                  enterStyle={{ opacity: 0, height: 0 }}
                  exitStyle={{ opacity: 0, height: 0 }}
                >
                  <ExercisesTable exercises={completedExercises} />
                </YStack>
              )}
            </AnimatePresence>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
