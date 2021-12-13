import React from 'react';
import { ListChildComponentProps } from 'react-window';
import classNames from 'classnames';
import Tippy from '@tippyjs/react/headless';
import { useGridContext } from '../../hooks';
import { GUTTER_WIDTH, HEADER_HEIGHT, PAD_WIDTH } from './constants';
import styles from './GridRow.scss';
import { SelectionModifier } from '../../types';
import { CellInput } from './CellInput';

export function GridRow({ index, style }: ListChildComponentProps) {
  const {
    columns,
    rows,
    frozenGridWidth,
    selectRow,
    onEditCell,
    onDeleteRow,
    onAddRow,
  } = useGridContext();
  const row = rows[index];

  const visibleColumns = columns.filter(e => e.isVisible);

  const css = classNames(
    styles.gridRow,
    {
      [styles.rowEven]: index % 2,
      [styles.rowEdited]: row && row.isEdited,
      [styles.rowDeleted]: row && row.isDeleted,
      [styles.rowAdded]: row && row.isAdded,
      [styles.rowSelected]: row && row.isSelected,
    },
  );

  const top = parseFloat(String(style.top)) + HEADER_HEIGHT;

  function handleMouseDown(ev: React.MouseEvent) {
    let modifier: SelectionModifier = 'select';

    if (ev.metaKey || ev.ctrlKey) modifier = 'append';
    if (ev.shiftKey) modifier = 'range';

    row && selectRow(index, modifier);
  }

  let width = 'auto';

  if (frozenGridWidth) {
    width = `${frozenGridWidth}px`;
  }

  return React.useMemo(() =>
    <div
      style={{ ...style, top, width }}
      className={css}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{ width: GUTTER_WIDTH }}
        className={styles.gutter}
      >
        {row && row.isActive && <span>&rarr;</span>}
        {row && !row.isActive && row.isSelected && <span>&bull;</span>}

        <Tippy
          placement="right"
          interactive
          render={() =>
            <div className={styles.gutterDropdown}>
              {onAddRow && <a onClick={() => onAddRow(row)}>Add row below</a>}
              {onDeleteRow && <a onClick={() => onDeleteRow(row)}>Delete</a>}
            </div>
          }
        >
          <a className={styles.gutterMenu}>e</a>
        </Tippy>
      </div>
      {visibleColumns.map(column => {
        const value = row?.getValue(column.name);
        const defaultValue = row?.isAdded && row?.getDefaultValue(column.name);

        return (
          <div
            key={`${index}-${column.name}`}
            style={{ width: column.width }}
            className={styles.cell}
            onDoubleClick={() => onEditCell && onEditCell(row, column)}
          >
            {row && row.editedCell === column.name ? (
              <CellInput row={row} column={column.name} />
            ) : (
              <span className={styles.truncate}>
                {row && value === null && !defaultValue && <span className={styles.null}>[Null]</span>}
                {row && defaultValue && <span className={styles.null}>{defaultValue}</span>}
                {row && value}
              </span>
            )}
          </div>
        );
      })}
      <div className={styles.pad} style={{ width: PAD_WIDTH }}></div>
    </div>
  , [row, columns, frozenGridWidth]);
}
