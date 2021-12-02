import { SelectionModifier } from './SelectionModifier';
import { Column, SortOrder } from './Column';
import { Row } from './Row';

export interface GridContextDescriptor {
  columns: Column[];
  rows: Row[];
  onResizeColumn(column: Column, width: number): void;
  onReorderColumn?(column: Column, order: SortOrder): void;
  onSortColumns(columns: Column[]): void;
  selectRow(index: number, modifier: SelectionModifier): void;
  onEditCell?(row: Row, column: Column): void;
  onCancelEditCell?(): void;
  onUpdateCell?(row: Row, column: string, value: string): void;
  onDeleteRow?(row: Row): void;
  onAddRow?(target: Row): void;
}
