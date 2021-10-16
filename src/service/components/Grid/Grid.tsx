import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { FixedSizeList } from 'react-window';
import { GridContext } from '../../contexts';
import { Column, SortOrder, Row, SelectionModifier } from '../../types';
import { getOffsetForIndex } from './utils';
import { GridElement } from './GridElement';
import { GridRow } from './GridRow';
import { ROW_HEIGHT } from './constants';

interface Props {
  width: number;
  height: number;
  columns: Column[];
  rows: Row[];
  onResizeColumn(column: Column, width: number): void;
  onReorderColumn(column: Column, order: SortOrder): void;
  onSortColumns(columns: Column[]): void;
  onSelectRows(startIndex: number, endIndex: number, modifier: SelectionModifier): void;
}

export interface GridRef {
  scrollToItem(index: number): void;
}

export const Grid = forwardRef<GridRef, Props>(({
  width,
  height,
  columns,
  rows,
  onResizeColumn,
  onReorderColumn,
  onSortColumns,
  onSelectRows,
}, ref) => {
  const elementRef = useRef<FixedSizeList>(null);
  const outerRef = useRef<HTMLDivElement>();

  useImperativeHandle(ref, () => ({
    scrollToItem(index: number) {
      const scrollTop = outerRef.current!.scrollTop;
      const offset = getOffsetForIndex(index, height, rows.length, ROW_HEIGHT, scrollTop);
      elementRef.current?.scrollTo(offset);
    }
  }));

  const visibleRowsCount = Math.floor(height / ROW_HEIGHT);
  let style = {};

  if (visibleRowsCount - 1 >= rows.length) {
    style = { overflow: 'auto hidden' };
  }

  const itemCount = Math.max(rows.length, visibleRowsCount);

  const contextValue = {
    columns,
    rows,
    onResizeColumn,
    onReorderColumn,
    onSortColumns,
    onSelectRows,
  }

  return (
    <GridContext.Provider value={contextValue}>
      <FixedSizeList
        ref={elementRef}
        outerRef={outerRef}
        style={style}
        width={width}
        height={height}
        innerElementType={GridElement}
        itemCount={itemCount}
        itemSize={ROW_HEIGHT}
        overscanCount={5}
      >
        {GridRow}
      </FixedSizeList>
    </GridContext.Provider>
  );
});
