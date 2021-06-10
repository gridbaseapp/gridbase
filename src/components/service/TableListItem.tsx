import React from 'react';
import { ListChildComponentProps } from 'react-window';
import classNames from 'classnames';
import { COLUMNS_ROW_HEIGHT, GUTTER_WIDTH } from './Table';
import { IColumn } from '../../utils/local-store';
import { Row } from './Table';
import styles from './TableListItem.scss';

interface DataProps {
  columns: IColumn[];
  rows: Row[];
  onSelectRow: (row: Row) => void;
};

export default function TableListItem({ data, index, style }: ListChildComponentProps) {
  const { columns, rows, onSelectRow } = data as DataProps;
  const top = parseFloat(String(style.top)) + COLUMNS_ROW_HEIGHT;
  const cls = classNames(styles.tableListItem, index % 2 ? styles.tableListItemEven : null);
  const row = rows[index];

  return (
    <div
      style={{ ...style, top, width: 'auto' }}
      className={cls}
      onClick={() => onSelectRow(row)}
    >
      <div
        style={{ width: GUTTER_WIDTH }}
        className={
          classNames(
            styles.tableListItemGutter,
            { [styles.selected]: row && row.isSelected('__gutter') },
          )
        }
      ></div>
      {columns.filter(column => column.visible).map(column =>
        <div
          key={`${index}-${column.name}`}
          style={{ width: column.width }}
          className={
            classNames(
              styles.tableListItemColumn,
              { [styles.selected]: row && row.isSelected(column.name) },
            )
          }
        >
          {row && row.getValue(column.name)}
        </div>
      )}
    </div>
  );
}
