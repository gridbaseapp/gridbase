import React, { useCallback, useEffect, useRef, useState } from 'react';
import { debounce, isEqual } from 'lodash';
import classNames from 'classnames';
import { useDidUpdateEffect, useElementSize, useFocus, useHotkey } from '../../../app/hooks';
import { useServiceContext, useServiceStash } from '../../hooks';
import { Column, Entity, SortOrder, Row } from '../../types';
import { mergeColumnsWithAttributes } from './utils';
import { Pagination } from './Pagination';
import { ColumnsSettingsModal } from './ColumnsSettingsModal';
import { SortSettingsModal } from './SortSettingsModal';
import { Grid, GridRef } from '../Grid';
import { COLUMN_MIN_WIDTH, COLUMN_MAX_WIDTH } from './constants';
import styles from './Table.scss';

const PER_PAGE = 1000;

type LoadingStatus = 'loading' | 'reloading' | 'success';

interface Props {
  entity: Entity;
  isVisible: boolean;
  hasFocus: boolean;
  onFocus(): void;
}

export function Table({ entity, isVisible, hasFocus, onFocus }: Props) {
  const [contentRef, contentSize] = useElementSize();

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
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const gridRef = useRef<GridRef>(null);

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
      adapter.queryNoTypeCasting(SQLRows),
    ]);

    const rows = resultRows.rows.map(e => new Row(e));

    return [resultTotal.rows[0].count, rows] as const;
  }

  useEffect(() => {
    (async () => {
      setLoadingStatus('loading');

      const cols = await loadColumns();
      const [total, rows] = await loadRows(cols, page);

      setColumns(cols);
      setTotal(total);
      setRows(rows);
      gridRef.current?.clearSelection();

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

  useHotkey(scopes, 'meta+r', async () => {
    setLoadingStatus('reloading');

    const cols = await loadColumns();
    const [total, rows] = await loadRows(cols, page);

    setColumns(cols);
    setTotal(total);
    setRows(rows);
    gridRef.current?.clearSelection();

    setLoadingStatus('success');
  }, [page]);

  function handleResizeColumn(column: Column, width: number) {
    if (width < COLUMN_MIN_WIDTH) width = COLUMN_MIN_WIDTH;
    if (width > COLUMN_MAX_WIDTH) width = COLUMN_MAX_WIDTH;

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
    gridRef.current?.clearSelection();

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
    gridRef.current?.clearSelection();

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
      gridRef.current?.clearSelection();

      setLoadingStatus('success');
    }
  }

  function handleSelectRows(selected: number[], active: number) {
    setRows(state => {
      const newRows: Row[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = state[i];

        if (i === active) {
          if (row.isActive) {
            newRows.push(row);
          } else {
            const newRow = new Row(row.cells);
            newRow.isActive = true;
            newRows.push(newRow);
          }
        } else if (selected.includes(i)) {
          if (row.isSelected && !row.isActive) {
            newRows.push(row);
          } else {
            const newRow = new Row(row.cells);
            newRow.isSelected = true;
            newRows.push(newRow);
          }
        } else {
          if (row.isSelected || row.isActive) {
            newRows.push(new Row(row.cells));
          } else {
            newRows.push(row);
          }
        }
      }

      return newRows;
    });
  }

  return (
    <div
      className={classNames(styles.table, { hidden: !isVisible, focus: hasFocus })}
      onFocus={onFocus}
    >
      {loadingStatus === 'loading' && <div className={styles.splash}>Loading...</div>}

      {loadingStatus !== 'loading' && (
        <>
          <div ref={contentRef} className={styles.content}>
            <Grid
              ref={gridRef}
              scopes={scopes}
              width={contentSize.width}
              height={contentSize.height}
              columns={columns}
              rows={rows}
              onResizeColumn={handleResizeColumn}
              onReorderColumn={handleReorderColumn}
              onSortColumns={setColumns}
              onSelectRows={handleSelectRows}
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
              onClick={handleColumnsSettingsModalTriggerClick}
            >
              {columns.find(e => !e.isVisible) && <span>*</span>}
              Columns Settings
            </a>

            <a
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
