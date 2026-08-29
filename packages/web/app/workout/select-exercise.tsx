import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { AnimatePresence, Button, H1, H2, ScrollView, XStack, YStack, useTheme } from "tamagui";
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
      <YStack p="$4" gap="$4">
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
              flex={1}
              style={{ minWidth: "45%" }}
            >
              <Button.Text
                color={selectedGroup === group.id ? "white" : "$gray12"}
                fontSize={16}
                fontWeight="600"
                style={{ textAlign: "center" }}
              >
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
                  <Button.Text color="$gray12" fontSize={16}>
                    {exercise.name}
                  </Button.Text>
                </Button>
              ))}
            </YStack>
          </YStack>
        )}

        {completedExercises.length > 0 && (
          <YStack gap="$2">
            <Button
              onPress={() => setCompletedExpanded(!completedExpanded)}
              bg="transparent"
              px="$0"
              py="$0"
              justify="flex-start"
              pressStyle={{ opacity: 0.7 }}
            >
              <Button.Text color="$color" fontSize={20} fontWeight="bold">
                Completed Exercises <MaterialIcons name={completedExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color={theme.gray11?.val ?? "#aaa"} />
              </Button.Text>
            </Button>
            <AnimatePresence>
              {completedExpanded && (
                <YStack
                  key="completed-table"
                  bg="$gray4"
                  rounded="$4"
                  overflow="hidden"
                  enterStyle={{ opacity: 0, height: 0 }}
                  exitStyle={{ opacity: 0, height: 0 }}
                >
                  <XStack
                    py="$2"
                    px="$4"
                    borderBottomWidth={1}
                    borderBottomColor="$gray6"
                  >
<H2 color="$gray11" fontSize={11} fontWeight="600" flex={2}>
                        EXERCISE
                      </H2>
                      <H2 color="$gray11" fontSize={11} fontWeight="600" flex={2}>
                        MUSCLE
                      </H2>
                      <H2 color="$gray11" fontSize={11} fontWeight="600" flex={1}>
                        SETS
                      </H2>
                      <H2 color="$gray11" fontSize={11} fontWeight="600" flex={2}>
                        BEST SET
                      </H2>
                  </XStack>
                  {completedExercises.map((exercise) => {
                    const bestSet = exercise.sets.reduce(
                      (best, s) => (!best || s.weight > best.weight ? s : best),
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
                        <H2 color="$gray11" fontSize={12} flex={2}>
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
              )}
            </AnimatePresence>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
