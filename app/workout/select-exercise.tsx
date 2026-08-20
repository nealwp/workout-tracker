import { useState } from "react";
import { Button, H1, ScrollView, XStack, YStack } from "tamagui";
import { EXERCISES, MUSCLE_GROUPS, type MuscleGroup } from "@/data/exercises";

export default function SelectExercise() {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);

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
                  onPress={() => {
                    // TODO: navigate to exercise tracking screen
                  }}
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
