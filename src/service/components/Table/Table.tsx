import React, { useCallback, useEffect, useState } from 'react';
import { debounce, isEqual } from 'lodash';
import classNames from 'classnames';
import { useDidUpdateEffect, useElementSize, useFocus, useHotkey } from '../../../app/hooks';
import { useServiceContext, useServiceStash } from '../../hooks';
import { Column, Entity, SortOrder } from '../../types';
import { mergeColumnsWithAttributes } from './utils';
import { Pagination } from './Pagination';
import { ColumnsSettingsModal } from './ColumnsSettingsModal';
import { SortSettingsModal } from './SortSettingsModal';
import { Grid } from '../Grid';
import styles from './Table.scss';

// interface ISelection {
//   index: number;
//   type: string;
// }

// export class Row {
//   row: any;
//   selectedColumns: string[];

//   constructor(row: any) {
//     this.row = row;
//     this.selectedColumns = [];
//   }

//   getValue(column: string) {
//     return this.row[column].toString();
//   }

//   select(column: string) {
//     this.selectedColumns.push(column);
//   }

//   isSelected(column: string) {
//     return this.selectedColumns.includes(column);
//   }
// }

const PER_PAGE = 1000;
const MIN_COLUMN_WIDTH = 50;

type LoadingStatus = 'loading' | 'reloading' | 'success';

interface Props {
  entity: Entity;
  isVisible: boolean;
  hasFocus: boolean;
}

export function Table({ entity, isVisible, hasFocus }: Props) {
  const [contentRef, contentSize] = useElementSize();

//   const outerRef = useRef(null);
//   const listRef = useRef<FixedSizeList>(null);
//   const selectedRows = useRef<ISelection[]>([]);
//   const lastSelectedRow = useRef<Row | null>(null);
//   const selectedColumns = useRef<ISelection[]>([]);
//   const lastSelectedColumn = useRef<string | null>(null);

  const { adapter, connection } = useServiceContext();

  const [
    loadColumnsFromStash,
    saveColumnsToStash,
  ] = useServiceStash<Column[]>(`columns.${entity.id}`, []);

  const [
    isColumnsSettingsModalVisible,
    setColumnsSettingsModalVisible,
  ] = useState(false);

  const [
    isSortSettingsModalVisible,
    setSortSettingsModalVisible,
  ] = useState(false);

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('loading');
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  function loadAttributes() {
    return adapter.getAttributes(entity.id);
  }

  async function loadColumns() {
    const attributes = await loadAttributes()
    const savedColumns = loadColumnsFromStash();

    return mergeColumnsWithAttributes(savedColumns, attributes);
  }

  async function loadRows(columns: Column[], page: number) {
    const relation = `"${entity.schema.name}"."${entity.name}"`;
    const offset = (page - 1) * PER_PAGE;

    const order = columns
      .filter(e => e.sort.order !== 'none')
      .sort((a, b) => a.sort.position - b.sort.position)
      .map(e => [e.name, e.sort.order].join(' '))
      .join(', ')

    const SQLTotal = `
      SELECT count(*)
      FROM ${relation}
    `;

    const orderSQL = order.length === 0 ? '' : `ORDER BY ${order}`;
    const SQLRows = `
      SELECT *
      FROM ${relation}
      ${orderSQL}
      LIMIT ${PER_PAGE}
      OFFSET ${offset}
    `;

    const [resultTotal, resultRows] = await Promise.all([
      adapter.query(SQLTotal),
      adapter.query(SQLRows),
    ]);

    return [resultTotal.rows[0].count, resultRows.rows] as const;
  }

  useEffect(() => {
    (async () => {
      setLoadingStatus('loading');

      const cols = await loadColumns();
      const [total, rows] = await loadRows(cols, page);

      setColumns(cols);
      setTotal(total);
      setRows(rows);

      setLoadingStatus('success');
    })();
  }, []);

  const debouncedSaveColumnsToStash = useCallback(debounce((cols) => {
    saveColumnsToStash(cols);
  }, 500), []);

  useDidUpdateEffect(() => {
    debouncedSaveColumnsToStash(columns);
  }, [columns]);

  const name = `Table-${connection.uuid}-${entity.id}`;
  const scopes = [`Service-${connection.uuid}`, name]

  useFocus(name, hasFocus);

  useHotkey(scopes, 'mod+r', async () => {
    setLoadingStatus('reloading');

    const cols = await loadColumns();
    const [total, rows] = await loadRows(cols, page);

    setColumns(cols);
    setTotal(total);
    setRows(rows);

    setLoadingStatus('success');
}, [page]);

//   useEffect(() => {
//     selectedRows.current = [];
//     selectedColumns.current = [];

//     if (order === null) return;

//     (async () => {
//       const schema = props.entity.schema?.name;
//       const table = props.entity.name;

//       let sql = `SELECT * FROM "${schema}"."${table}" `;
//       if (order !== '') sql += `ORDER BY ${order} `;
//       sql += `LIMIT ${PER_PAGE} OFFSET ${(page - 1) * PER_PAGE}`;

//       const [total, rows] = await Promise.all([
//         adapter.query(`SELECT count(*) FROM "${schema}"."${table}"`),
//         adapter.query(sql),
//       ]);

//       setTotalRecords(total.rows[0].count);
//       setRows(rows.rows.map(e => new Row(e)));
//       if (listRef.current) listRef.current.scrollToItem(0);
//     })();
//   }, [page, order]);

//   const onSelectRow = (row: Row, mode: string) => {
//     selectedColumns.current = [];

//     const index = rows.indexOf(row);

//     if (index < 0) return;

//     if (mode === 'select') {
//       selectedRows.current = [{ index, type: 'select' }];
//     }

//     if (mode === 'add') {
//       const existing = selectedRows.current.find(e => e.index === index);
//       if (existing) {
//         selectedRows.current.splice(selectedRows.current.indexOf(existing), 1);
//       } else {
//         selectedRows.current.push({ index, type: 'add' });
//       }

//       selectedRows.current.forEach(e => e.type = 'add');
//     }

//     if (mode === 'range') {
//       let startIndex = 0;
//       let endIndex = index;

//       if (lastSelectedRow.current) startIndex = rows.indexOf(lastSelectedRow.current);
//       if (startIndex > endIndex) [startIndex, endIndex] = [endIndex, startIndex];

//       selectedRows.current = selectedRows.current.filter(e => e.type !== 'range');

//       for (let i = startIndex; i <= endIndex; i++) {
//         const existing = selectedRows.current.find(e => e.index === i);
//         if (existing) {
//           existing.type = 'range';
//         } else {
//           selectedRows.current.push({ index: i, type: 'range' });
//         }
//       }
//     } else {
//       lastSelectedRow.current = row;
//     }

//     rows.forEach(r => r.selectedColumns = []);

//     selectedRows.current.forEach(selection => {
//       const r = rows[selection.index];
//       r.select('__gutter');
//       columns.forEach(col => col.visible && r.select(col.name));
//     });

//     setRows(rows.map(e => e));
//   }

//   const onSelectColumn = (column: string, mode: string) => {
//     selectedRows.current = [];

//     const index = columns.findIndex(e => e.name === column);

//     if (index < 0) return;

//     if (mode === 'select') {
//       selectedColumns.current = [{ index, type: 'select' }];
//     }

//     if (mode === 'add') {
//       const existing = selectedColumns.current.find(e => e.index === index);
//       if (existing) {
//         selectedColumns.current.splice(selectedColumns.current.indexOf(existing), 1);
//       } else {
//         selectedColumns.current.push({ index, type: 'add' });
//       }

//       selectedColumns.current.forEach(e => e.type = 'add');
//     }

//     if (mode === 'range') {
//       let startIndex = 0;
//       let endIndex = index;

//       if (lastSelectedColumn.current) {
//         startIndex = columns.findIndex(e => e.name === lastSelectedColumn.current);
//       }
//       if (startIndex > endIndex) [startIndex, endIndex] = [endIndex, startIndex];

//       selectedColumns.current = selectedColumns.current.filter(e => e.type !== 'range');

//       for (let i = startIndex; i <= endIndex; i++) {
//         const existing = selectedColumns.current.find(e => e.index === i);
//         if (existing) {
//           existing.type = 'range';
//         } else {
//           selectedColumns.current.push({ index: i, type: 'range' });
//         }
//       }
//     } else {
//       lastSelectedColumn.current = column;
//     }

//     const columnNames = selectedColumns.current.map(e => columns[e.index].name);
//     rows.forEach(r => r.selectedColumns = columnNames);
//     setRows(rows.map(e => e));
//   }

//   const onSelectRegion = useCallback((top: number, left: number, bottom: number, right: number) => {
//     selectedRows.current = [];
//     selectedColumns.current = [];

//     const startRow = Math.floor((top - COLUMNS_ROW_HEIGHT) / ITEM_HEIGHT);
//     const endRow = Math.floor((bottom - COLUMNS_ROW_HEIGHT) / ITEM_HEIGHT) + 1;

//     let colNames: string[] = [];

//     let colLeft = GUTTER_WIDTH;

//     if (left < colLeft) {
//       colNames = [
//         '__gutter',
//         ...columns.filter(col => col.visible).map(col => col.name),
//       ];
//     } else {
//       columns
//         .filter(col => col.visible)
//         .forEach(col => {
//           const colRight = colLeft + col.width;
//           if (colRight > left && colLeft < right) colNames.push(col.name);
//           colLeft += col.width;
//         });
//     }

//     rows.forEach(r => r.selectedColumns = []);

//     for (let i = startRow; i < endRow; i++) {
//       if(rows[i]) rows[i].selectedColumns = colNames;
//     }

//     setRows(rows.map(e => e));
//   }, [columns, rows]);

  function handleResizeColumn(column: Column, width: number) {
    if (width < MIN_COLUMN_WIDTH) width = MIN_COLUMN_WIDTH;

    setColumns(state => {
      const i = state.findIndex(e => e.name === column.name);

      return [
        ...state.slice(0, i),
        { ...state[i], width },
        ...state.slice(i + 1),
      ];
    });
  }

  async function handleReorderColumn(column: Column, order: SortOrder) {
    let position = column.sort.position;

    if (position === 0) {
      position = Math.max(...columns.map(e => e.sort.position)) + 1;
    }

    if (order === 'none') {
      position = 0;
    }

    const newColumns = columns.map(e => {
      if (e.name === column.name) {
        return {
          ...e,
          sort: { position, order },
        };
      } else {
        let ePosition = e.sort.position;
        if (order === 'none' && ePosition > column.sort.position) ePosition -= 1;

        return {
          ...e,
          sort: { ...e.sort, position: ePosition },
        };
      }
    });

    setLoadingStatus('reloading');

    const attributes = await loadAttributes();
    const cols = mergeColumnsWithAttributes(newColumns, attributes);

    setColumns(cols);

    const [total, rows] = await loadRows(cols, page);

    setTotal(total);
    setRows(rows);

    setLoadingStatus('success');
  }

  async function handlePageChange(newPage: number) {
    if (page === newPage) return;

    setLoadingStatus('reloading');

    setPage(newPage);

    const cols = await loadColumns();
    const [total, rows] = await loadRows(cols, newPage);

    setColumns(cols);
    setTotal(total);
    setRows(rows);

    setLoadingStatus('success');
  }

  function handleColumnsSettingsModalTriggerClick(ev: React.MouseEvent) {
    ev.preventDefault();
    setColumnsSettingsModalVisible(true);
  }

  function handleSortSettingsModalTriggerClick(ev: React.MouseEvent) {
    ev.preventDefault();
    setSortSettingsModalVisible(true);
  }

  function handleColumnsSettingsApply(newColumns: Column[]) {
    setColumnsSettingsModalVisible(false);
    if (!isEqual(columns, newColumns)) setColumns(newColumns);
  }

  async function handleSortSettingsApply(newColumns: Column[]) {
    setSortSettingsModalVisible(false);

    if (!isEqual(columns, newColumns)) {
      setLoadingStatus('reloading');

      const attributes = await loadAttributes();
      const cols = mergeColumnsWithAttributes(newColumns, attributes);

      setColumns(cols);

      const [total, rows] = await loadRows(cols, page);

      setTotal(total);
      setRows(rows);

      setLoadingStatus('success');
    }
  }

  return (
    <div className={classNames(styles.table, { hidden: !isVisible })}>
      {loadingStatus === 'loading' && <div className={styles.splash}>Loading...</div>}

      {loadingStatus !== 'loading' && (
        <>
          <div ref={contentRef} className={styles.content}>
            <Grid
              width={contentSize.width}
              height={contentSize.height}
              columns={columns}
              rows={rows}
              onResizeColumn={handleResizeColumn}
              onReorderColumn={handleReorderColumn}
              onSortColumns={setColumns}
            />
          </div>

          <div className={styles.footer}>
            {loadingStatus === 'reloading' && <div className={styles.spinner}>Loading...</div>}

            <Pagination
              total={total}
              page={page}
              per={PER_PAGE}
              onChange={handlePageChange}
            />

            <a
              href=""
              onClick={handleColumnsSettingsModalTriggerClick}
            >
              {columns.find(e => !e.isVisible) && <span>*</span>}
              Columns Settings
            </a>

            <a
              href=""
              onClick={handleSortSettingsModalTriggerClick}
            >
              {columns.find(e => e.sort.position > 0) && <span>*</span>}
              Sort Settings
            </a>
          </div>
        </>
      )}

      {isColumnsSettingsModalVisible &&
        <ColumnsSettingsModal
          columns={columns}
          onClose={() => setColumnsSettingsModalVisible(false)}
          onApply={handleColumnsSettingsApply}
        />
      }

      {isSortSettingsModalVisible &&
        <SortSettingsModal
          columns={columns}
          onClose={() => setSortSettingsModalVisible(false)}
          onApply={handleSortSettingsApply}
        />
      }

    </div>
  );
}
