import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { FixedSizeList } from 'react-window';
import { GridContext } from '../../contexts';
import { Column, SortOrder, Row, SelectionModifier } from '../../types';
import { getOffsetForIndex } from './utils';
import { GridElement } from './GridElement';
import { GridRow } from './GridRow';
import { ROW_HEIGHT } from './constants';
import { useHotkey } from '../../../app/hooks';

interface Props {
  scopes: string[];
  width: number;
  height: number;
  columns: Column[];
  rows: Row[];
  onResizeColumn(column: Column, width: number): void;
  onReorderColumn?(column: Column, order: SortOrder): void;
  onSortColumns(columns: Column[]): void;
  onSelectRows(selected: number[], active: number): void;
}

export interface GridRef {
  clearSelection(): void;
}

export const Grid = forwardRef<GridRef, Props>(({
  scopes,
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
    clearSelection() {
      selectedRows.current.clear();
      activeRow.current = -1;
      rangeStartRow.current = 0;
    },
  }));

  function scrollToItem(index: number) {
    const scrollTop = outerRef.current!.scrollTop;
    const offset = getOffsetForIndex(index, height, rows.length, ROW_HEIGHT, scrollTop);
    elementRef.current?.scrollTo(offset);
  }

  const selectedRows = useRef<Set<number>>(new Set());
  const activeRow = useRef<number>(-1);
  const rangeStartRow = useRef<number>(0);

  useHotkey(scopes, 'arrowdown', () => {
    let index = activeRow.current + 1;
    if (index > rows.length - 1) index = rows.length - 1;
    selectRow(index, 'select');
    scrollToItem(index);
  }, [height, rows]);

  useHotkey(scopes, 'meta+arrowdown', () => {
    selectRow(rows.length - 1, 'select');
    scrollToItem(rows.length - 1);
  }, [height, rows]);

  useHotkey(scopes, 'shift+arrowdown', () => {
    let index = activeRow.current + 1;
    if (index > rows.length - 1) index = rows.length - 1;
    selectRow(index, 'range');
    scrollToItem(index);
  }, [height, rows]);

  useHotkey(scopes, 'meta+shift+arrowdown', () => {
    selectRow(rows.length - 1, 'range');
    scrollToItem(rows.length - 1);
  }, [height, rows]);

  useHotkey(scopes, 'arrowup', () => {
    let index = activeRow.current - 1;
    if (index === -2) index = rows.length - 1;
    if (index < 0) index = 0;
    selectRow(index, 'select');
    scrollToItem(index);
  }, [height, rows]);

  useHotkey(scopes, 'meta+arrowup', () => {
    selectRow(0, 'select');
    scrollToItem(0);
  }, [height, rows]);

  useHotkey(scopes, 'shift+arrowup', () => {
    let index = activeRow.current - 1;
    if (index < 0) index = 0;
    selectRow(index, 'range');
    scrollToItem(index);
  }, [height, rows]);

  useHotkey(scopes, 'meta+shift+arrowup', () => {
    selectRow(0, 'range');
    scrollToItem(0);
  }, [height, rows]);

  useHotkey(scopes, 'meta+a', () => {
    selectRow(0, 'select');
    selectRow(rows.length - 1, 'range');
  }, []);

  useHotkey(scopes, 'escape', () => {
    selectRow(-1, 'select');
  }, []);

  function selectRow(index: number, modifier: SelectionModifier) {
    if (index === -1) {
      selectedRows.current.clear();
      activeRow.current = -1;
      rangeStartRow.current = 0;

      onSelectRows([], -1);
      return;
    }

    if (modifier === 'select') {
      selectedRows.current.clear();
      selectedRows.current.add(index);
      activeRow.current = index;
    }

    if (modifier === 'append') {
      if (selectedRows.current.has(index)) {
        selectedRows.current.delete(index);

        if (activeRow.current === index) {
          if (selectedRows.current.size > 0) {
            activeRow.current = Math.max(...selectedRows.current);
          } else {
            activeRow.current = -1;
          }
        }
      } else {
        selectedRows.current.add(index);
        activeRow.current = index;
      }
    }

    if (modifier === 'range') {
      let [from, to] = [index, activeRow.current].sort((a, b) => a - b);

      for (let i = from; i <= to; i++) {
        selectedRows.current.delete(i);
      }

      [from, to] = [index, rangeStartRow.current].sort((a, b) => a - b);

      for (let i = from; i <= to; i++) {
        selectedRows.current.add(i);
      }

      activeRow.current = index;
    } else {
      rangeStartRow.current = index;
    }

    onSelectRows(Array.from(selectedRows.current), activeRow.current);
  }

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
    selectRow,
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
