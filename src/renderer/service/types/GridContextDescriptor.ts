import React, { Dispatch, SetStateAction } from 'react';
import { SelectionModifier } from './SelectionModifier';
import { Column, SortOrder } from './Column';
import { Row } from './Row';

export interface GridContextDescriptor {
  columns: Column[];
  rows: Row[];
  frozenGridWidth: number | null;
  gridOuterRef: React.MutableRefObject<HTMLDivElement | undefined>;
  setFrozenGridWidth: Dispatch<SetStateAction<number | null>>;
  onResizeColumn(column: Column, width: number): void;
  onReorderColumn?(column: Column, order: SortOrder): void;
  onSortColumns(columns: Column[]): void;
  selectRow(index: number, modifier: SelectionModifier): void;
  onEditCell?(row: Row, column: Column): void;
  onCancelEditCell?(): void;
  onUpdateCell?(row: Row, column: string, value: string): void;
  onDeleteRow?(row: Row): void;
  onAddRow?(target: Row): void;
  onSaveChange?(): void;
}
