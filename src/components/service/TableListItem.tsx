import React from 'react';
import { ListChildComponentProps } from 'react-window';
import classNames from 'classnames';
import { COLUMNS_ROW_HEIGHT, GUTTER_WIDTH } from './Table';
import { IColumn } from '../../utils/local-store';
import styles from './TableListItem.scss';

export default function TableListItem({ data, index, style }: ListChildComponentProps) {
  const { columns, rows } = data as { columns: IColumn[], rows: any[] };
  const top = parseFloat(String(style.top)) + COLUMNS_ROW_HEIGHT;
  const cls = classNames(styles.tableListItem, index % 2 ? styles.tableListItemEven : null);
  const row = rows[index];

  return (
    <div style={{ ...style, top, width: 'auto' }} className={cls}>
      <div style={{ width: GUTTER_WIDTH }} className={styles.tableListItemGutter}></div>
      {columns.filter(column => column.visible).map(column =>
        <div
          key={`${index}-${column.name}`}
          style={{ width: column.width }}
          className={styles.tableListItemColumn}
        >
          {row && row[column.name].toString()}
        </div>
      )}
    </div>
  );
}
