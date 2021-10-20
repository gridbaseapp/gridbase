import React from 'react';
import { ListChildComponentProps } from 'react-window';
import classNames from 'classnames';
import { useGridContext } from '../../hooks';
import { GUTTER_WIDTH, HEADER_HEIGHT } from './constants';
import styles from './GridRow.scss';
import { SelectionModifier } from '../../types';

export function GridRow({ index, style }: ListChildComponentProps) {
  const { columns, rows, onSelectRows } = useGridContext();

  const row = rows[index];

  const visibleColumns = columns.filter(e => e.isVisible);

  const css = classNames(
    styles.gridRow,
    {
      [styles.rowEven]: index % 2,
      [styles.rowSelected]: row && row.isSelected,
    },
  );

  const top = parseFloat(String(style.top)) + HEADER_HEIGHT;

  function handleMouseDown(ev: React.MouseEvent) {
    let modifier: SelectionModifier = 'select';

    if (ev.metaKey || ev.ctrlKey) modifier = 'append';
    if (ev.shiftKey) modifier = 'range';

    row && onSelectRows(index, index, modifier);
  }

  return (
    <div
      style={{ ...style, top, width: 'auto' }}
      className={css}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{ width: GUTTER_WIDTH }}
        className={styles.gutter}
      >
        {row && row.isActive && <span>&rarr;</span>}
        {row && !row.isActive && row.isSelected && <span>&bull;</span>}
      </div>
      {visibleColumns.map(column =>
        <div
          key={`${index}-${column.name}`}
          style={{ width: column.width }}
          className={styles.cell}
        >
          <span className={styles.truncate}>
            {row && row.getValue(column.name)}
          </span>
        </div>
      )}
    </div>
  );
}