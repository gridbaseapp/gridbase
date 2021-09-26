import React from 'react';
import { ListChildComponentProps } from 'react-window';
import classNames from 'classnames';
import { useGridContext } from '../../hooks';
import { GUTTER_WIDTH, HEADER_HEIGHT } from './constants';
// import { COLUMNS_ROW_HEIGHT, GUTTER_WIDTH } from './Table';
// import { IColumn } from '../../utils/local-store';
// import { Row } from './Table';
import styles from './Row.scss';

// interface DataProps {
//   columns: IColumn[];
//   rows: Row[];
//   onSelectRow: (row: Row, mode: string) => void;
// };

export function Row({ index, style }: ListChildComponentProps) {
  const { columns, rows } = useGridContext();

  const row = rows[index];

//   const onClick = (ev: React.MouseEvent) => {
//     let mode = 'select';
//     if (ev.metaKey) mode = 'add';
//     if (ev.shiftKey) mode = 'range';
//     onSelectRow(row, mode);
//   }

  const visibleColumns = columns.filter(e => e.isVisible);

  const css = classNames(
    styles.row,
    { [styles.rowEven]: index % 2 },
  );

  const top = parseFloat(String(style.top)) + HEADER_HEIGHT;

  return (
    <div style={{ ...style, top, width: 'auto' }} className={css}>
      <div
        style={{ width: GUTTER_WIDTH }}
        className={styles.gutter}
      ></div>
      {visibleColumns.map(column =>
        <div
          key={`${index}-${column.name}`}
          style={{ width: column.width }}
          className={styles.cell}
        >
          <span className={styles.truncate}>
            {row && row[column.name]}
          </span>
        </div>
      )}
    </div>
  );
}
