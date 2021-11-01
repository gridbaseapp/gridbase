import { SelectionModifier } from './SelectionModifier';
import { Column, SortOrder } from './Column';
import { Row } from './Row';

export interface GridContextDescriptor {
  columns: Column[];
  rows: Row[];
  onResizeColumn(column: Column, width: number): void;
  onReorderColumn?(column: Column, order: SortOrder): void;
  onSortColumns(columns: Column[]): void;
  onSelectRows(startIndex: number, endIndex: number, modifier: SelectionModifier): void;
}
