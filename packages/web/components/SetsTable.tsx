import type { SetData } from "@irondog/shared";
import { DataTable, type DataTableColumn } from "@/components/DataTable";

interface SetsTableProps {
  sets: SetData[];
}

const columns: DataTableColumn<SetData>[] = [
  {
    key: "set",
    label: "SET",
    flex: 1,
    render: (set) => set.id,
    fontWeight: () => "600",
  },
  {
    key: "weight",
    label: "WEIGHT",
    flex: 2,
    render: (set) => `${set.weight} lbs`,
  },
  {
    key: "reps",
    label: "REPS",
    flex: 2,
    render: (set) => set.reps,
  },
  {
    key: "failure",
    label: "FAILURE",
    flex: 2,
    render: (set) => (set.failure ? "✓" : "—"),
    color: (set) => (set.failure ? "$red10" : "$gray11"),
    fontWeight: (set) => (set.failure ? "600" : "400"),
  },
];

export function SetsTable({ sets }: SetsTableProps) {
  return <DataTable columns={columns} data={sets} keyExtractor={(set) => set.id} />;
}
