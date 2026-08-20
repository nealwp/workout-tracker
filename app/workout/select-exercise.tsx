import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EXERCISES, MUSCLE_GROUPS, type MuscleGroup } from "@/data/exercises";

export default function SelectExercise() {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);

  const filteredExercises = selectedGroup
    ? EXERCISES.filter((e) => e.muscleGroup === selectedGroup)
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Choose Muscle Group</Text>

      <View style={styles.groupGrid}>
        {MUSCLE_GROUPS.map((group) => (
          <Pressable
            key={group.id}
            style={[
              styles.groupButton,
              selectedGroup === group.id && styles.groupButtonActive,
            ]}
            onPress={() => setSelectedGroup(group.id)}
          >
            <Text
              style={[
                styles.groupButtonText,
                selectedGroup === group.id && styles.groupButtonTextActive,
              ]}
            >
              {group.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedGroup && (
        <>
          <Text style={styles.heading}>Choose Exercise</Text>
          <View style={styles.exerciseList}>
            {filteredExercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                style={styles.exerciseButton}
                onPress={() => {
                  // TODO: navigate to exercise tracking screen
                }}
              >
                <Text style={styles.exerciseButtonText}>{exercise.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    marginTop: 16,
  },
  groupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  groupButton: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#333333",
  },
  groupButtonActive: {
    backgroundColor: "#e63946",
    borderColor: "#e63946",
  },
  groupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  groupButtonTextActive: {
    color: "#ffffff",
  },
  exerciseList: {
    gap: 8,
  },
  exerciseButton: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  exerciseButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
