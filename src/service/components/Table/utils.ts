import { Column } from "../../types";

export function mergeColumnsWithAttributes(columns: Column[], attributes: string[]) {
  const mergedColumns: Column[] = [];

  columns.forEach(e => {
    const attribute = attributes.find(attr => attr === e.name);

    if (attribute) {
      mergedColumns.push({ ...createDefaultColumn(attribute), ...e });
    }
  });

  attributes.forEach(attribute => {
    const savedColumn = columns.find(e => e.name === attribute);

    if (!savedColumn) {
      mergedColumns.push(createDefaultColumn(attribute));
    }
  });

  mergedColumns
    .filter(e => e.sort.position > 0)
    .sort((a, b) => a.sort.position - b.sort.position)
    .forEach((e, i) => e.sort.position = i + 1)

  return mergedColumns;
}

function createDefaultColumn(name: string): Column {
  return {
    name: name,
    isVisible: true,
    width: 100,
    sort: { position: 0, order: 'none' },
  }
}
