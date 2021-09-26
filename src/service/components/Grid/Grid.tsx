import React from 'react';
import { FixedSizeList } from 'react-window';
import { GridContext } from '../../contexts';
import { Column, SortOrder } from '../../types';
import { GridElement } from './GridElement';
import { Row } from './Row';
import { ROW_HEIGHT } from './constants';

interface Props {
  width: number;
  height: number;
  columns: Column[];
  rows: any[];
  onResizeColumn(column: Column, width: number): void
  onReorderColumn(column: Column, order: SortOrder): void
  onSortColumns(columns: Column[]): void
}

export function Grid({
  width,
  height,
  columns,
  rows,
  onResizeColumn,
  onReorderColumn,
  onSortColumns,
}: Props) {

  const visibleRowsCount = Math.floor(height / ROW_HEIGHT);
  let style = {};

  if (visibleRowsCount - 1 > rows.length) {
    style = { overflow: 'auto hidden' };
  }

  const itemCount = Math.max(rows.length, visibleRowsCount);

  const contextValue = {
    columns,
    rows,
    onResizeColumn,
    onReorderColumn,
    onSortColumns,
  }

  return (
    <GridContext.Provider value={contextValue}>
      <FixedSizeList
        style={style}
        width={width}
        height={height}
        innerElementType={GridElement}
        itemCount={itemCount}
        itemSize={ROW_HEIGHT}
        overscanCount={5}
      >
        {Row}
      </FixedSizeList>
    </GridContext.Provider>
  );
}
