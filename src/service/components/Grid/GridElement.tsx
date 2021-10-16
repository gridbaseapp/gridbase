import React, { forwardRef, useRef } from 'react';
import { Header } from './Header';
import styles from './GridElement.scss';
import { GUTTER_WIDTH, HEADER_HEIGHT, ROW_HEIGHT } from './constants';
import { useGridContext } from '../../hooks';
import { useMouseSelectable } from '../../../app/hooks';

interface Props {
  children: React.ReactNode;
  style: React.CSSProperties;
}

export const GridElement = forwardRef<HTMLDivElement, Props>(({ children, style }, ref) => {
  const { columns, rows, onSelectRows } = useGridContext();

  const initialSelectionIndex = useRef(-1);

  const handleMouseDown = useMouseSelectable({
    onSelect(rect) {
      const startIndex = Math.max(
        0,
        Math.floor((rect.top - HEADER_HEIGHT) / ROW_HEIGHT),
      );

      const endIndex = Math.min(
        rows.length - 1,
        Math.floor((rect.bottom - HEADER_HEIGHT) / ROW_HEIGHT),
      );

      if (initialSelectionIndex.current === -1) {
        initialSelectionIndex.current = startIndex;
      }

      let from = 0;
      let to = 0;

      if (startIndex >= initialSelectionIndex.current) {
        from = startIndex;
        to = endIndex;
      } else {
        from = endIndex;
        to = startIndex;
      }

      onSelectRows(from, to, 'select');
    },
    onEnd() {
      initialSelectionIndex.current = -1;
    }
  });

  const height = parseFloat(String(style.height)) + HEADER_HEIGHT;
  const width = GUTTER_WIDTH + columns
    .filter(e => e.isVisible)
    .reduce((acc, e) => acc + e.width, 0);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{ ...style, height, width, minWidth: '100%' }}
    >
      <Header />

      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
});
