import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { throttle } from 'lodash';
import classNames from 'classnames';
import { FixedSizeList } from 'react-window';
import { EntityType, IEntity, IState } from '../../state';
import { ColumnDirection, IColumn } from '../../utils/local-store';
import TableList from './TableList';
import TableListItem from './TableListItem';
import Pagination from './Padination';
import ColumnsConfigurationModal from './ColumnsConfigurationModal';
import ColumnsSortModal from './ColumnsSortModal';
import styles from './Table.scss';
import hotkeys from '../../utils/hotkeys';

interface ITableProps {
  visible: boolean;
  hasFocus: boolean;
  entity: IEntity;
}

interface ITableListContext {
  entity: IEntity;
  columns: IColumn[];
  outerContainer: React.MutableRefObject<any | null>;
  setColumns: React.Dispatch<React.SetStateAction<IColumn[]>>
  onSelectColumn: (column: string, mode: string) => void;
  onSelectRegion: (left: number, top: number, right: number, bottom: number) => void;
}

interface ISelection {
  index: number;
  type: string;
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
  const tableContentRef = useRef<HTMLDivElement>(null);
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

  const [contentRect, setContentRect] = useState({ width: 0, height: 0 });

  const selectedRows = useRef<ISelection[]>([]);
  const lastSelectedRow = useRef<Row | null>(null);

  const selectedColumns = useRef<ISelection[]>([]);
  const lastSelectedColumn = useRef<string | null>(null);

  useEffect(() => {
    if (!tableContentRef.current) return;

    const onResize = throttle(entries => {
      const rect = entries[0].contentRect;
      setContentRect({ width: rect.width, height: rect.height });
    }, 25);

    // @ts-ignore
    const observer = new ResizeObserver(onResize);

    observer.observe(tableContentRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

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
    selectedRows.current = [];
    selectedColumns.current = [];

    rows.forEach(r => r.selectedColumns = []);
    setRows(rows.map(e => e));

    if (columns.length === 0) return;

    const order = columns
      .filter(e => e.order.position > 0)
      .sort((a, b) => a.order.position - b.order.position)
      .map(e => `"${e.name}" ${e.order.direction}`)
      .join(', ');

      setOrder(order);
  }, [columns]);

  useEffect(() => {
    selectedRows.current = [];
    selectedColumns.current = [];

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

  useEffect(() => {
    const context = `service.${adapter.connection.uuid}.Table.${props.entity.name}`;

    if (props.visible && props.hasFocus) {
      hotkeys.bind(context, {
        'up': () => {
          if (rows.length === 0) return;

          let idx = 0;
          if (selectedRows.current) {
            idx = selectedRows.current[0].index;
          }

          idx -= 1;

          if (idx === -1) idx = rows.length - 1;
          onSelectRow(rows[idx], 'select');
        },
        'down': () => {
          if (rows.length === 0) return;

          let idx = 0;
          if (selectedRows.current) {
            idx = selectedRows.current[0].index;
          }

          idx += 1;

          if (idx >= rows.length) idx = 0;
          onSelectRow(rows[idx], 'select');
        },
      });
    } else {
      hotkeys.unbind(context);
    }

    return () => hotkeys.unbind(context);
  }, [props.visible, props.hasFocus, rows, selectedRows]);

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

  const onSelectRow = (row: Row, mode: string) => {
    selectedColumns.current = [];

    const index = rows.indexOf(row);

    if (index < 0) return;

    if (mode === 'select') {
      selectedRows.current = [{ index, type: 'select' }];
    }

    if (mode === 'add') {
      const existing = selectedRows.current.find(e => e.index === index);
      if (existing) {
        selectedRows.current.splice(selectedRows.current.indexOf(existing), 1);
      } else {
        selectedRows.current.push({ index, type: 'add' });
      }

      selectedRows.current.forEach(e => e.type = 'add');
    }

    if (mode === 'range') {
      let startIndex = 0;
      let endIndex = index;

      if (lastSelectedRow.current) startIndex = rows.indexOf(lastSelectedRow.current);
      if (startIndex > endIndex) [startIndex, endIndex] = [endIndex, startIndex];

      selectedRows.current = selectedRows.current.filter(e => e.type !== 'range');

      for (let i = startIndex; i <= endIndex; i++) {
        const existing = selectedRows.current.find(e => e.index === i);
        if (existing) {
          existing.type = 'range';
        } else {
          selectedRows.current.push({ index: i, type: 'range' });
        }
      }
    } else {
      lastSelectedRow.current = row;
    }

    rows.forEach(r => r.selectedColumns = []);

    selectedRows.current.forEach(selection => {
      const r = rows[selection.index];
      r.select('__gutter');
      columns.forEach(col => col.visible && r.select(col.name));
    });

    setRows(rows.map(e => e));
  }

  const onSelectColumn = (column: string, mode: string) => {
    selectedRows.current = [];

    const index = columns.findIndex(e => e.name === column);

    if (index < 0) return;

    if (mode === 'select') {
      selectedColumns.current = [{ index, type: 'select' }];
    }

    if (mode === 'add') {
      const existing = selectedColumns.current.find(e => e.index === index);
      if (existing) {
        selectedColumns.current.splice(selectedColumns.current.indexOf(existing), 1);
      } else {
        selectedColumns.current.push({ index, type: 'add' });
      }

      selectedColumns.current.forEach(e => e.type = 'add');
    }

    if (mode === 'range') {
      let startIndex = 0;
      let endIndex = index;

      if (lastSelectedColumn.current) {
        startIndex = columns.findIndex(e => e.name === lastSelectedColumn.current);
      }
      if (startIndex > endIndex) [startIndex, endIndex] = [endIndex, startIndex];

      selectedColumns.current = selectedColumns.current.filter(e => e.type !== 'range');

      for (let i = startIndex; i <= endIndex; i++) {
        const existing = selectedColumns.current.find(e => e.index === i);
        if (existing) {
          existing.type = 'range';
        } else {
          selectedColumns.current.push({ index: i, type: 'range' });
        }
      }
    } else {
      lastSelectedColumn.current = column;
    }

    const columnNames = selectedColumns.current.map(e => columns[e.index].name);
    rows.forEach(r => r.selectedColumns = columnNames);
    setRows(rows.map(e => e));
  }

  const onSelectRegion = useCallback((top: number, left: number, bottom: number, right: number) => {
    selectedRows.current = [];
    selectedColumns.current = [];

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

  const rowsToFit = Math.floor(contentRect.height / ITEM_HEIGHT) + 1;
  let style = {};

  if (rowsToFit - 2 > rows.length) {
    style = { overflow: 'auto hidden' };
  }

  return (
    <div className={classNames(styles.table, { hidden: !props.visible })}>
      <div ref={tableContentRef} className={styles.content}>
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
            width={contentRect.width}
            height={contentRect.height}
            innerElementType={TableList}
            itemCount={Math.max(rows.length, rowsToFit)}
            itemSize={ITEM_HEIGHT}
            itemData={{ columns, rows, onSelectRow }}
            overscanCount={5}
          >
            {TableListItem}
          </FixedSizeList>
        </TableListContext.Provider>
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
