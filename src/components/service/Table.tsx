import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { FixedSizeList } from 'react-window';
import AutoSizer from './../AutoSizer';
import { EntityType, IEntity, IState } from '../../state';
import { ColumnDirection, IColumn } from '../../utils/local-store';
import TableList from './TableList';
import TableListItem from './TableListItem';
import Pagination from './Padination';
import ColumnsConfigurationModal from './ColumnsConfigurationModal';
import ColumnsSortModal from './ColumnsSortModal';
import styles from './Table.scss';

interface ITableProps {
  visible: boolean;
  entity: IEntity;
}

interface ITableListContext {
  entity: IEntity;
  columns: IColumn[];
  outerContainer: React.MutableRefObject<any | null>;
  setColumns: React.Dispatch<React.SetStateAction<IColumn[]>>
  onSelectColumn: (column: string) => void;
  onSelectRegion: (left: number, top: number, right: number, bottom: number) => void;
}

export class Row {
  row: any;
  selectedColumns: string[];

  constructor(row: any) {
    this.row = row;
    this.selectedColumns = [];
  }

  getValue(column: string) {
    return this.row[column].toString();
  }

  select(column: string) {
    this.selectedColumns.push(column);
  }

  isSelected(column: string) {
    return this.selectedColumns.includes(column);
  }
}

export const COLUMNS_ROW_HEIGHT = 30;
export const GUTTER_WIDTH = 30;
const DEFAULT_COLUMN_WIDTH = 100;
const ITEM_HEIGHT = 20;

const PER_PAGE = 1000;

export const TableListContext = React.createContext<ITableListContext>({
  entity: { id: '-1', name: '', type: EntityType.Table },
  columns: [],
  outerContainer: { current: null },
  setColumns: () => {},
  onSelectColumn: () => {},
  onSelectRegion: () => {},
});

export default function Table(props: ITableProps) {
  const outerRef = useRef(null);
  const listRef = useRef<FixedSizeList>(null);
  const adapter = useSelector((state: IState) => state.adapter);
  const localStore = useSelector((state: IState) => state.localStore);
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [
    isColumnsConfigurationModalVisible,
    setColumnsConfigurationModalVisible
  ] = useState<boolean>(false);
  const [
    isColumnsSortModalVisible,
    setColumnsSortModalVisible
  ] = useState<boolean>(false);

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
        if (attr) cols.push(colSet);
      });

      attributes.forEach(attr => {
        if (!columnsSettings.map(el => el.name).includes(attr.name)) {
          cols.push({
            ...attr,
            visible: true,
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
      setRows(rows.rows.map(e => new Row(e)));
      if (listRef.current) listRef.current.scrollToItem(0);
    })();
  }, [page, order]);

  const applyColumnsConfigurationChanges = (cols: IColumn[]) => {
    setColumns(cols);
    setColumnsConfigurationModalVisible(false);
    localStore.setColumnsSettings(adapter.connection.uuid, props.entity.id, cols);
  }

  const applyColumnsSortChanges = (cols: IColumn[]) => {
    setColumns(cols);
    setColumnsSortModalVisible(false);
    localStore.setColumnsSettings(adapter.connection.uuid, props.entity.id, cols);
  }

  const onSelectRow = (row: Row) => {
    rows.forEach(r => r.selectedColumns = []);
    row.select('__gutter');
    columns.forEach(col => col.visible && row.select(col.name));
    setRows(rows.map(e => e));
  }

  const onSelectColumn = (column: string) => {
    rows.forEach(r => r.selectedColumns = []);
    rows.forEach(r => r.select(column));
    setRows(rows.map(e => e));
  }

  const onSelectRegion = useCallback((top: number, left: number, bottom: number, right: number) => {
    const startRow = Math.floor((top - COLUMNS_ROW_HEIGHT) / ITEM_HEIGHT);
    const endRow = Math.floor((bottom - COLUMNS_ROW_HEIGHT) / ITEM_HEIGHT) + 1;

    let colNames: string[] = [];

    let colLeft = GUTTER_WIDTH;

    if (left < colLeft) {
      colNames = [
        '__gutter',
        ...columns.filter(col => col.visible).map(col => col.name),
      ];
    } else {
      columns
        .filter(col => col.visible)
        .forEach(col => {
          const colRight = colLeft + col.width;
          if (colRight > left && colLeft < right) colNames.push(col.name);
          colLeft += col.width;
        });
    }

    rows.forEach(r => r.selectedColumns = []);

    for (let i = startRow; i < endRow; i++) {
      if(rows[i]) rows[i].selectedColumns = colNames;
    }

    setRows(rows.map(e => e));
  }, [columns, rows]);

  return (
    <div className={classNames(styles.table, { hidden: !props.visible })}>
      <div className={styles.content}>
        <AutoSizer>
          {(width, height) => {
            const rowsToFit = Math.floor(height / ITEM_HEIGHT) + 1;
            let style = {};

            if (rowsToFit - 2 > rows.length) {
              style = { overflow: 'hidden' };
            }

            return (
              <TableListContext.Provider
                value={{
                  entity: props.entity,
                  columns,
                  setColumns,
                  onSelectColumn,
                  onSelectRegion,
                  outerContainer: outerRef,
                }}
              >
                <FixedSizeList
                  ref={listRef}
                  outerRef={outerRef}
                  style={style}
                  width={width}
                  height={height}
                  innerElementType={TableList}
                  itemCount={Math.max(rows.length, rowsToFit)}
                  itemSize={ITEM_HEIGHT}
                  itemData={{ columns, rows, onSelectRow }}
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
        <a
          href=""
          onClick={(ev) => {ev.preventDefault(); setColumnsConfigurationModalVisible(true);}}
        >
          {columns.find(e => !e.visible) && <span>*</span>}
          col config
        </a>
        <a
          href=""
          onClick={(ev) => {ev.preventDefault(); setColumnsSortModalVisible(true);}}
        >
          {columns.find(e => e.order.position > 0) && <span>*</span>}
          sort config
        </a>
      </div>

      {isColumnsConfigurationModalVisible &&
        <ColumnsConfigurationModal
          columns={columns}
          onClose={() => setColumnsConfigurationModalVisible(false)}
          onApply={applyColumnsConfigurationChanges}
        />
      }

      {isColumnsSortModalVisible &&
        <ColumnsSortModal
          columns={columns}
          onClose={() => setColumnsSortModalVisible(false)}
          onApply={applyColumnsSortChanges}
        />
      }
    </div>
  );
}
