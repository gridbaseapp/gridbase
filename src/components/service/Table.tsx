import React, { ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from './../AutoSizer';
import styles from './Table.scss';
import { IEntity, IState } from '../../state';

interface ITableProps {
  visible: boolean;
  entity: IEntity;
}

interface IInnerListElementProps {
  children: ReactElement;
  style: React.CSSProperties;
}

interface IAttribute {
  name: string;
  position: number;
}

const COLUMNS_ROW_HEIGHT = 30;
const GUTTER_WIDTH = 30;
const DEFAULT_COLUMN_WIDTH = 150;
const ITEM_HEIGHT = 20;

export default function Table(props: ITableProps) {
  const adapter = useSelector((state: IState) => state.adapter);
  const [columns, setColumns] = useState<IAttribute[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [columns, rows] = await Promise.all([
        adapter.getAttributes(props.entity.id),
        adapter.query(`SELECT * FROM "${props.entity.schema?.name}"."${props.entity.name}"`),
      ]);

      setColumns(columns);
      setRows(rows.rows);
    })();
  }, []);

  const InnerListElement = ({ children, style }: IInnerListElementProps) => {
    const height = parseFloat(style.height as string) + COLUMNS_ROW_HEIGHT;

    return (
      <div style={{ ...style, height }}>
        <div style={{ height: COLUMNS_ROW_HEIGHT }} className={styles.columnsRow}>
          <div style={{ width: GUTTER_WIDTH }} className={styles.gutter}></div>
          {columns.map(column => (
            <div
              key={column.name}
              style={{ width: DEFAULT_COLUMN_WIDTH }}
              className={styles.column}
            >
              {column.name}
            </div>
          ))}
        </div>

        {children}
      </div>
    );
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    const top = parseFloat(style.top as string) + COLUMNS_ROW_HEIGHT;
    const cls = classNames(styles.row, index % 2 ? styles.rowEven : null);
    const row = rows[index];

    return (
      <div style={{ ...style, top, width: 'auto' }} className={cls}>
        <div style={{ width: GUTTER_WIDTH }} className={styles.gutter}></div>
        {columns.map(column =>
          <div
            key={`${index}-${column.name}`}
            style={{ width: DEFAULT_COLUMN_WIDTH }}
            className={styles.column}
          >
            {row && row[column.name]}
          </div>
        )}
        </div>
    );
  };

  return (
    <div className={classNames(styles.table, { hidden: !props.visible })}>
      <AutoSizer>
        {(width, height) => {
          const rowsToFit = Math.floor(height / ITEM_HEIGHT) + 1;
          let style = {};

          if (rowsToFit - 2 > rows.length) {
            style = { overflow: 'auto hidden' };
          }

          return (
            <FixedSizeList
              style={style}
              width={width}
              height={height}
              innerElementType={InnerListElement}
              itemCount={Math.max(rows.length, rowsToFit)}
              itemSize={ITEM_HEIGHT}
              overscanCount={5}
            >
              {Row}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </div>
  );
}
