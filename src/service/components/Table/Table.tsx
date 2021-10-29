import React, { useCallback, useEffect, useState, useRef } from 'react';
import { debounce, isEqual } from 'lodash';
import classNames from 'classnames';
import { useDidUpdateEffect, useElementSize, useFocus, useHotkey } from '../../../app/hooks';
import { useServiceContext, useServiceStash } from '../../hooks';
import { Column, Entity, SortOrder, Row, SelectionModifier } from '../../types';
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
}

export function Table({ entity, isVisible, hasFocus }: Props) {
  const [contentRef, contentSize] = useElementSize();

  const { adapter, connection } = useServiceContext();

  const [
    loadColumnsFromStash,
    saveColumnsToStash,
  ] = useServiceStash<Column[]>(`columns.${entity.id}`, []);

  const gridRef = useRef<GridRef>(null);
  const rangeSelectionInitialIndex = useRef<number>(-1);

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

    setLoadingStatus('success');
  }, [page]);

  useHotkey(scopes, 'arrowup', () => {
    rangeSelectionInitialIndex.current = -1;

    const idx = rows.findIndex(e => e.isActive);
    rows.forEach(e => e.isSelected = false);

    if (idx === -1) {
      rows[rows.length - 1].isActive = true;
      gridRef.current?.scrollToItem(rows.length - 1);
    } else if (idx === 0) {
      rows[idx].isActive = false;
    } else {
      rows[idx].isActive = false;
      rows[idx - 1].isActive = true;
      gridRef.current?.scrollToItem(idx - 1);
    }

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'meta+arrowup', () => {
    rangeSelectionInitialIndex.current = -1;

    const idx = rows.findIndex(e => e.isActive);
    rows.forEach(e => e.isSelected = false);

    if (idx !== -1) {
      rows[idx].isActive = false;
    }

    rows[0].isActive = true;
    gridRef.current?.scrollToItem(0);

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'shift+arrowup', () => {
    const idx = rows.findIndex(e => e.isActive);

    if (idx === -1) {
      rows[rows.length - 1].isActive = true;
      gridRef.current?.scrollToItem(rows.length - 1);
    } else if (idx > 0) {
      rows[idx].isSelected = !rows[idx - 1].isSelected;
      rows[idx - 1].isActive = true;
      gridRef.current?.scrollToItem(idx - 1);
    }

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'meta+shift+arrowup', () => {
    const idx = rows.findIndex(e => e.isActive);
    rangeSelectionInitialIndex.current = idx;

    rows.forEach((e, i) => e.isSelected = i <= idx);

    rows[0].isActive = true;
    gridRef.current?.scrollToItem(0);

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'arrowdown', () => {
    rangeSelectionInitialIndex.current = -1;

    const idx = rows.findIndex(e => e.isActive);
    rows.forEach(e => e.isSelected = false);

    if (idx === -1) {
      rows[0].isActive = true;
      gridRef.current?.scrollToItem(0);
    } else if (idx === rows.length - 1) {
      rows[idx].isActive = false;
    } else {
      rows[idx].isActive = false;
      rows[idx + 1].isActive = true;
      gridRef.current?.scrollToItem(idx + 1);
    }

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'meta+arrowdown', () => {
    rangeSelectionInitialIndex.current = -1;

    const idx = rows.findIndex(e => e.isActive);
    rows.forEach(e => e.isSelected = false);

    if (idx !== -1) {
      rows[idx].isActive = false;
    }

    rows[rows.length - 1].isActive = true;
    gridRef.current?.scrollToItem(rows.length - 1);

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'shift+arrowdown', () => {
    const idx = rows.findIndex(e => e.isActive);

    if (idx === -1) {
      rows[0].isActive = true;
      gridRef.current?.scrollToItem(0);
    } else if (idx < rows.length - 1) {
      rows[idx].isSelected = !rows[idx + 1].isSelected;
      rows[idx + 1].isActive = true;
      gridRef.current?.scrollToItem(idx + 1);
    }

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'meta+shift+arrowdown', () => {
    const idx = rows.findIndex(e => e.isActive);
    rangeSelectionInitialIndex.current = idx;

    rows.forEach((e, i) => e.isSelected = i >= idx);

    rows[rows.length - 1].isActive = true;
    gridRef.current?.scrollToItem(rows.length - 1);

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'meta+a', () => {
    rangeSelectionInitialIndex.current = -1;

    rows.forEach(e => e.isSelected = true);
    rows[rows.length - 1].isActive = true;

    setRows([...rows]);
  }, [rows]);

  useHotkey(scopes, 'escape', () => {
    rangeSelectionInitialIndex.current = -1;

    rows.forEach(e => e.isSelected = false);
    const idx = rows.findIndex(e => e.isActive);

    if (idx !== -1) {
      rows[idx].isActive = false;
    }

    setRows([...rows]);
  }, [rows]);

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

  function handleSelectRows(
    startIndex: number,
    endIndex: number,
    modifier: SelectionModifier,
  ) {
    if (modifier === 'select') {
      rangeSelectionInitialIndex.current = -1;

      let from = 0;
      let to = 0;

      if (startIndex <= endIndex) {
        from = startIndex;
        to = endIndex;
      } else {
        from = endIndex;
        to = startIndex;
      }

      rows.forEach((e, i) => e.isSelected = i >= from && i <= to);
      rows[endIndex].isActive = true;
    } else if (modifier === 'append') {
      rangeSelectionInitialIndex.current = -1;

      if (rows[startIndex].isSelected) {
        rows[endIndex].isSelected = false;
        const active = rows.find(e => e.isActive);

        if (!active) {
          const lastSelected = [...rows].reverse().find(e => e.isSelected);
          if (lastSelected) lastSelected.isActive = true;
        }
      } else {
        rows.forEach(e => {
          if (e.isActive) e.isSelected = true;
        });
        rows[endIndex].isActive = true;
      }
    } else if (modifier === 'range') {
      let activeIdx = rows.findIndex(e => e.isActive);
      if (activeIdx === -1) activeIdx = 0;

      if (rangeSelectionInitialIndex.current === -1) {
        rangeSelectionInitialIndex.current = activeIdx;
      }

      let from = 0;
      let to = 0;

      if (startIndex >= activeIdx) {
        from = activeIdx;
        to = startIndex;
      } else {
        from = startIndex;
        to = activeIdx;
      }

      for (let i = from; i <= to ;i++) {
        rows[i].isSelected = false;
      }

      if (startIndex >= rangeSelectionInitialIndex.current) {
        from = rangeSelectionInitialIndex.current;
        to = startIndex;
      } else {
        from = startIndex;
        to = rangeSelectionInitialIndex.current;
      }

      for (let i = from; i <= to ;i++) {
        rows[i].isSelected = true;
      }

      rows[startIndex].isActive = true;
    }

    setRows([...rows]);
  }

  return (
    <div className={classNames(styles.table, { hidden: !isVisible, focus: hasFocus })}>
      {loadingStatus === 'loading' && <div className={styles.splash}>Loading...</div>}

      {loadingStatus !== 'loading' && (
        <>
          <div ref={contentRef} className={styles.content}>
            <Grid
              ref={gridRef}
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
