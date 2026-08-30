import type { CompletedExercise } from "@/context/WorkoutContext";
import { DataTable, type DataTableColumn } from "@/components/DataTable";

interface ExercisesTableProps {
  exercises: CompletedExercise[];
}

const columns: DataTableColumn<CompletedExercise>[] = [
  {
    key: "exercise",
    label: "EXERCISE",
    flex: 3,
    render: (exercise) => exercise.name,
    fontWeight: () => "600",
  },
  {
    key: "sets",
    label: "SETS",
    flex: 1,
    render: (exercise) => exercise.sets.length,
  },
];

export function ExercisesTable({ exercises }: ExercisesTableProps) {
  return <DataTable columns={columns} data={exercises} keyExtractor={(exercise) => exercise.id} />;
}
