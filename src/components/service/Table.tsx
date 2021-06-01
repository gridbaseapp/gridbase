import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { FixedSizeList } from 'react-window';
import AutoSizer from './../AutoSizer';
import { EntityType, IEntity, IState } from '../../state';
import { ColumnDirection, IColumn } from '../../utils/local-store';
import TableList from './TableList';
import TableListItem from './TableListItem';
import Pagination from './Padination';
import styles from './Table.scss';

interface ITableProps {
  visible: boolean;
  entity: IEntity;
}

interface ITableListContext {
  entity: IEntity;
  columns: IColumn[];
  setColumns: (columns: IColumn[]) => void;
}

export const COLUMNS_ROW_HEIGHT = 30;
export const GUTTER_WIDTH = 30;
const DEFAULT_COLUMN_WIDTH = 100;
const ITEM_HEIGHT = 20;

const PER_PAGE = 1000;

export const TableListContext = React.createContext<ITableListContext>({
  entity: { id: '-1', name: '', type: EntityType.Table },
  columns: [],
  setColumns: () => {},
});

export default function Table(props: ITableProps) {
  const listRef = useRef<FixedSizeList>(null);
  const adapter = useSelector((state: IState) => state.adapter);
  const localStore = useSelector((state: IState) => state.localStore);
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const attributes = await adapter.getAttributes(props.entity.id);

      const columnsSettings = localStore.getColumnsSettings(
        adapter.connection.uuid,
        props.entity.id,
      );

      const cols: IColumn[] = [];

      columnsSettings.forEach(colSet => {
        const attr = attributes.find(el => el.name === colSet.name);
        if (attr) cols.push({ ...colSet, width: colSet.width || DEFAULT_COLUMN_WIDTH });
      });

      attributes.forEach(attr => {
        if (!columnsSettings.map(el => el.name).includes(attr.name)) {
          cols.push({
            ...attr,
            width: DEFAULT_COLUMN_WIDTH,
            order: { direction: ColumnDirection.NONE, position: 0 },
          });
        }
      });

      setColumns(cols);
    })();
  }, []);

  useEffect(() => {
    if (columns.length === 0) return;

    const order = columns
      .filter(e => e.order.position > 0)
      .sort((a, b) => a.order.position - b.order.position)
      .map(e => `"${e.name}" ${e.order.direction}`)
      .join(', ');

      setOrder(order);
  }, [columns]);

  useEffect(() => {
    if (order === null) return;

    (async () => {
      const schema = props.entity.schema?.name;
      const table = props.entity.name;

      let sql = `SELECT * FROM "${schema}"."${table}" `;
      if (order !== '') sql += `ORDER BY ${order} `;
      sql += `LIMIT ${PER_PAGE} OFFSET ${(page - 1) * PER_PAGE}`;

      const [total, rows] = await Promise.all([
        adapter.query(`SELECT count(*) FROM "${schema}"."${table}"`),
        adapter.query(sql),
      ]);

      setTotalRecords(total.rows[0].count);
      setRows(rows.rows);
      if (listRef.current) listRef.current.scrollToItem(0);
    })();
  }, [page, order]);

  return (
    <div className={classNames(styles.table, { hidden: !props.visible })}>
      <div className={styles.content}>
        <AutoSizer>
          {(width, height) => {
            const rowsToFit = Math.floor(height / ITEM_HEIGHT) + 1;
            let style = {};

            if (rowsToFit - 2 > rows.length) {
              style = { overflow: 'auto hidden' };
            }

            return (
              <TableListContext.Provider value={{ entity: props.entity, columns, setColumns }}>
                <FixedSizeList
                  ref={listRef}
                  style={style}
                  width={width}
                  height={height}
                  innerElementType={TableList}
                  itemCount={Math.max(rows.length, rowsToFit)}
                  itemSize={ITEM_HEIGHT}
                  itemData={{ columns, rows }}
                  overscanCount={5}
                >
                  {TableListItem}
                </FixedSizeList>
              </TableListContext.Provider>
            );
          }}
        </AutoSizer>
      </div>

      <div className={styles.footer}>
        <Pagination
          totalRecords={totalRecords}
          page={page}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
