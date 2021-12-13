import { useCallback, useRef } from 'react';
import { useGridContext } from '../../../hooks';
import { Column } from '../../../types';
import { COLUMN_MIN_WIDTH, COLUMN_MAX_WIDTH } from '../../Table/constants';
import { GUTTER_WIDTH, PAD_WIDTH } from '../constants';

const SCROLL_THRESHOLD = 50;
const SCROLL_SPEED = 5;

const OVERFLOW_MAX = 30;
const OVERFLOW_RATIO = 0.1;

export function useResizableColumn(column: Column, onResize: (width: number) => void) {
  const columnRef = useRef<HTMLDivElement | null>(null);
  const { gridOuterRef, columns, setFrozenGridWidth } = useGridContext();

  const onMouseDown = useCallback((ev: React.MouseEvent) => {
    const containerRect = gridOuterRef.current!.getBoundingClientRect();

    let previousX = ev.clientX;
    let clientX = previousX;
    const columnHandleDiff = columnRef.current!.getBoundingClientRect().right - clientX;

    document.body.style.cursor = 'col-resize';

    const gridWidth = GUTTER_WIDTH + PAD_WIDTH + columns
      .filter(e => e.isVisible)
      .reduce((acc, e) => acc + e.width, 0);

    setFrozenGridWidth(gridWidth);

    const interval = setInterval(() => {
      let x = clientX;
      let overflow = 0;

      const columnRect = columnRef.current!.getBoundingClientRect();

      if (columnRect.right > containerRect.right - SCROLL_THRESHOLD) {
        const delta = Math.min(
          columnRect.right - (containerRect.right - SCROLL_THRESHOLD),
          SCROLL_SPEED,
        );
        gridOuterRef.current!.scrollBy(delta, 0);
        previousX = (containerRect.right - SCROLL_THRESHOLD) - columnHandleDiff;
        return;
      }

      if (columnRect.right < containerRect.left + SCROLL_THRESHOLD + GUTTER_WIDTH) {
        const delta = Math.max(
          columnRect.right - (containerRect.left + SCROLL_THRESHOLD + GUTTER_WIDTH),
          -SCROLL_SPEED,
        );
        gridOuterRef.current!.scrollBy(delta, 0);
        previousX = (containerRect.left + SCROLL_THRESHOLD + GUTTER_WIDTH) - columnHandleDiff;
        return;
      }

      if (x < columnRect.left + COLUMN_MIN_WIDTH) {
        x = columnRect.left + COLUMN_MIN_WIDTH;
      }

      if (x > columnRect.left + COLUMN_MAX_WIDTH) {
        x = columnRect.left + COLUMN_MAX_WIDTH;
      }

      const potentialColumnWidth = columnRect.width + (x - previousX);

      if (columnRect.left + potentialColumnWidth > containerRect.right - SCROLL_THRESHOLD) {
        x = containerRect.right - SCROLL_THRESHOLD - columnHandleDiff;

        overflow = Math.min(
          columnRect.left + potentialColumnWidth - (containerRect.right - SCROLL_THRESHOLD),
          OVERFLOW_MAX,
        )
      }

      const containerLeftThreshold = containerRect.left + SCROLL_THRESHOLD + GUTTER_WIDTH;

      if (columnRect.left + potentialColumnWidth < containerLeftThreshold) {
        x = containerLeftThreshold - columnHandleDiff;

        overflow = Math.max(
          columnRect.left + potentialColumnWidth - containerLeftThreshold,
          -OVERFLOW_MAX,
        )
      }

      overflow = Math.round(overflow * OVERFLOW_RATIO);

      const columnWidth = Math.max(columnRect.width + (x - previousX) + overflow, COLUMN_MIN_WIDTH);
      onResize(columnWidth);
      gridOuterRef.current!.scrollBy(overflow, 0);

      if (overflow > 0) {
        const gridWidth = GUTTER_WIDTH + PAD_WIDTH + columnWidth + columns
          .filter(e => e.isVisible)
          .filter(e => e.name !== column.name)
          .reduce((acc, e) => acc + e.width, 0);

        setFrozenGridWidth(gridWidth);
      }

      previousX = x;
    }, 20);

    function onMouseMove(ev: MouseEvent) {
      clientX = ev.clientX;
    }

    function onMouseUp() {
      clearInterval(interval);

      document.body.style.cursor = 'auto';
      setFrozenGridWidth(null);

      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

  }, [columns]);

  return {
    resizableColumnRef: columnRef,
    resizableTrigger: onMouseDown,
  };
}
