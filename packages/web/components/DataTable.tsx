import type { ReactNode } from "react";
import { H2, XStack, YStack, type ColorTokens, type FontWeightTokens } from "tamagui";
import { Pressable } from "react-native";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  flex: number;
  render: (item: T) => ReactNode;
  color?: (item: T) => ColorTokens;
  fontWeight?: (item: T) => FontWeightTokens;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  expandedKey?: string | number | null;
  onToggle?: (item: T) => void;
  renderExpanded?: (item: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  expandedKey = null,
  onToggle,
  renderExpanded,
}: DataTableProps<T>) {
  const expandable = !!renderExpanded && !!onToggle;

  const renderRow = (item: T) => {
    const key = keyExtractor(item);
    const isExpanded = expandedKey === key;

    const row = (
      <XStack
        py="$2"
        px="$4"
        items="center"
        borderBottomWidth={1}
        borderBottomColor="$gray5"
      >
        {columns.map((column) => (
          <H2
            key={column.key}
            color={column.color?.(item) ?? "$color"}
            fontSize={13}
            fontWeight={column.fontWeight?.(item) ?? "400"}
            flex={column.flex}
          >
            {column.render(item)}
          </H2>
        ))}
      </XStack>
    );

    const content = expandable ? (
      <Pressable onPress={() => onToggle(item)}>
        {row}
      </Pressable>
    ) : (
      row
    );

    return (
      <YStack key={key}>
        {content}
        {expandable && isExpanded && renderExpanded(item)}
      </YStack>
    );
  };

  return (
    <YStack bg="$gray4" rounded="$4" overflow="hidden">
      <XStack py="$2" px="$4" borderBottomWidth={1} borderBottomColor="$gray6">
        {columns.map((column) => (
          <H2 key={column.key} color="$gray11" fontSize={11} fontWeight="600" flex={column.flex}>
            {column.label}
          </H2>
        ))}
      </XStack>
      {data.map(renderRow)}
    </YStack>
  );
}
