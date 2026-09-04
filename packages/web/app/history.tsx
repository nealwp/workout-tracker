import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, H1, H2, Paragraph, ScrollView, XStack, YStack } from "tamagui";
import type { SetData, Workout } from "@irondog/shared";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { listWorkouts } from "@/lib/api/client";

const formatDate = (date: string) => {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

function SetRow({ set }: { set: SetData }) {
  return (
    <XStack py="$1" px="$4" items="center">
      <H2 color="$gray12" fontSize={13} fontWeight="600" flex={1}>
        {set.id}
      </H2>
      <H2 color="$color" fontSize={13} flex={2}>
        {set.weight} lbs
      </H2>
      <H2 color="$color" fontSize={13} flex={2}>
        {set.reps}
      </H2>
      <H2
        color={set.failure ? "$red10" : "$gray11"}
        fontSize={13}
        fontWeight={set.failure ? "600" : "400"}
        flex={2}
      >
        {set.failure ? "✓" : "—"}
      </H2>
    </XStack>
  );
}

const columns: DataTableColumn<Workout>[] = [
  {
    key: "date",
    label: "DATE",
    flex: 3,
    render: (workout) => formatDate(workout.date),
    fontWeight: () => "600",
  },
  {
    key: "exercises",
    label: "EXERCISES",
    flex: 2,
    render: (workout) => workout.exercises.length,
  },
];

export default function History() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listWorkouts()
      .then((result) => {
        if (!cancelled) setWorkouts(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const renderExpanded = (workout: Workout) => (
    <YStack bg="$gray5" pb="$3" borderBottomWidth={1} borderBottomColor="$gray5">
      <XStack py="$2" px="$4">
        <H2 color="$gray11" fontSize={11} fontWeight="600" flex={1}>
          SET
        </H2>
        <H2 color="$gray11" fontSize={11} fontWeight="600" flex={2}>
          WEIGHT
        </H2>
        <H2 color="$gray11" fontSize={11} fontWeight="600" flex={2}>
          REPS
        </H2>
        <H2 color="$gray11" fontSize={11} fontWeight="600" flex={2}>
          FAILURE
        </H2>
      </XStack>
      {workout.exercises.map((exercise) => (
        <YStack key={exercise.id}>
          <H2 color="$gray12" fontSize={14} fontWeight="700" px="$4" pt="$2" pb="$1">
            {exercise.name}
          </H2>
          {exercise.sets.map((set) => (
            <SetRow key={set.id} set={set} />
          ))}
        </YStack>
      ))}
    </YStack>
  );

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
          style={{ alignSelf: "flex-start" }}
        >
          <XStack gap="$1" items="center">
            <MaterialIcons name="arrow-back" size={18} color="$gray12" />
            <Button.Text color="$gray12" fontSize={14} fontWeight="600">
              Back
            </Button.Text>
          </XStack>
        </Button>

        <H1 color="$color" fontSize={24} fontWeight="bold">
          Workout History
        </H1>

        {loading ? (
          <Paragraph color="$gray11" fontSize={14}>
            Loading...
          </Paragraph>
        ) : workouts.length === 0 ? (
          <Paragraph color="$gray11" fontSize={14}>
            No workouts yet.
          </Paragraph>
        ) : (
          <DataTable
            columns={columns}
            data={workouts}
            keyExtractor={(workout) => workout.id}
            expandedKey={expandedId}
            onToggle={(workout) =>
              setExpandedId((prev) => (prev === workout.id ? null : workout.id))
            }
            renderExpanded={renderExpanded}
          />
        )}
      </YStack>
    </ScrollView>
  );
}
