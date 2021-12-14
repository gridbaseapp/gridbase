import React, { useCallback, useEffect, useRef, useState } from 'react';
import { debounce, isEqual } from 'lodash';
import classNames from 'classnames';
import { useDidUpdateEffect, useElementSize, useFocus, useHotkey } from '../../../app/hooks';
import { useServiceContext, useServiceStore } from '../../hooks';
import { Column, Entity, SortOrder, Row, LoadingStatus } from '../../types';
import { mergeColumnsWithAttributes } from './utils';
import { Pagination } from './Pagination';
import { ColumnsSettingsModal } from './ColumnsSettingsModal';
import { SortSettingsModal } from './SortSettingsModal';
import { ChangesBanner } from './ChangesBanner';
import { Grid, GridRef } from '../Grid';
import { ExportModal } from '../ExportModal';
import styles from './Table.scss';

const PER_PAGE = 1000;

interface Props {
  entity: Entity;
  isVisible: boolean;
  hasFocus: boolean;
  onFocus(): void;
}

export function Table({ entity, isVisible, hasFocus, onFocus }: Props) {
  const [contentRef, contentSize] = useElementSize();

  const { adapter, connection, schemas } = useServiceContext();

  const [
    loadColumnsFromStash,
    saveColumnsToStash,
  ] = useServiceStore<Column[]>(`columns.${entity.id}`, []);

  const [isExportModalVisible, setExportModalVisible] = useState(false);

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

  async function loadAttributes() {
    return (await adapter.getAttributes(entity.id)).map(e => e.name);
  }

  async function loadColumns() {
    const attributes = await loadAttributes()
    const savedColumns = loadColumnsFromStash();

    return mergeColumnsWithAttributes(savedColumns, attributes);
  }

  async function loadRows(columns: Column[], page: number) {
    const schema = schemas.find(e => e.id === entity.schemaId)!;
    const relation = `"${schema.name}"."${entity.name}"`;
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

    const [
      resultTotal,
      resultsAttributes,
      resultRows,
    ] = await Promise.all([
      adapter.query(SQLTotal),
      adapter.getAttributes(entity.id),
      adapter.queryNoTypeCasting(SQLRows),
    ]);

    const rows = resultRows.rows.map(e => new Row(resultsAttributes, e));

    return [Number(resultTotal.rows[0].count), rows] as const;
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
            const newRow = new Row(row.attributes, row.cells, row.updatedCells);
            newRow.isActive = true;
            newRow.isDeleted = row.isDeleted;
            newRow.isAdded = row.isAdded;
            newRows.push(newRow);
          }
        } else if (selected.includes(i)) {
          if (row.isSelected && !row.isActive) {
            newRows.push(row);
          } else {
            const newRow = new Row(row.attributes, row.cells, row.updatedCells);
            newRow.isSelected = true;
            newRow.isDeleted = row.isDeleted;
            newRow.isAdded = row.isAdded;
            newRows.push(newRow);
          }
        } else {
          if (row.isSelected || row.isActive) {
            const newRow = new Row(row.attributes, row.cells, row.updatedCells);
            newRow.isDeleted = row.isDeleted;
            newRow.isAdded = row.isAdded;
            newRows.push(newRow);
          } else {
            newRows.push(row);
          }
        }
      }

      return newRows;
    });
  }

  function handleEditCell(row: Row, column: Column) {
    setRows(state => {
      const newRows: Row[] = [];

      state.forEach(r => {
        if (r === row) {
          const newRow = new Row(r.attributes, r.cells, r.updatedCells);
          newRow.editedCell = column.name;
          newRow.isActive = true;
          newRow.isDeleted = r.isDeleted;
          newRow.isAdded = r.isAdded;
          newRows.push(newRow);
        } else if (r.editedCell) {
          const newRow = new Row(r.attributes, r.cells, r.updatedCells);
          newRow.isDeleted = r.isDeleted;
          newRow.isAdded = r.isAdded;
          newRows.push(newRow);
        } else {
          newRows.push(r);
        }
      });

      return newRows;
    });
  }

  function handleCancelEditCell() {
    setRows(state => {
      const newRows: Row[] = [];

      state.forEach(r => {
        if (r.editedCell) {
          const row = new Row(r.attributes, r.cells, r.updatedCells);
          row.isActive = true;
          row.isDeleted = r.isDeleted;
          row.isAdded = r.isAdded;
          newRows.push(row);
        } else {
          newRows.push(r);
        }
      });

      return newRows;
    });
  }

  function handleUpdateCell(row: Row, column: string, value: string) {
    setRows(state => {
      const newRows: Row[] = [];

      state.forEach(r => {
        if (r === row) {
          const newRow = new Row(r.attributes, r.cells, r.updatedCells);
          newRow.isActive = true;
          newRow.isDeleted = row.isDeleted;
          newRow.isAdded = row.isAdded;
          newRow.editedCell = column;
          newRow.updateValue(column, value);
          newRows.push(newRow);
        } else {
          newRows.push(r);
        }
      });

      return newRows;
    });
  }

  function handleDeleteRow(row: Row) {
    setRows(state => {
      const newRows: Row[] = [];

      state.forEach(r => {
        if (r === row) {
          const newRow = new Row(r.attributes, r.cells, r.updatedCells);
          newRow.isDeleted = true;
          newRows.push(newRow);
        } else {
          newRows.push(r);
        }
      });

      return newRows;
    });
  }

  function handleAddRow(target: Row) {
    setRows(state => {
      const newRows: Row[] = [];

      state.forEach(r => {
        newRows.push(r);

        if (r === target) {
          const cells: any = {};
          Object.keys(r.cells).forEach(field => cells[field] = null);
          const newRow = new Row(r.attributes, cells);
          newRow.isAdded = true;
          newRows.push(newRow);
        }
      });

      return newRows;
    });
  }

  async function handleSaveChange() {
    setLoadingStatus('reloading');

    const promises: Promise<any>[] = [];

    const updates = rows.filter(e => e.hasChanges);

    const schema = schemas.find(e => e.id === entity.schemaId)!;
    const relation = `"${schema.name}"."${entity.name}"`;

    updates.forEach(row => {
      const pks = row.attributes
        .filter(e => e.primary)
        .map(e => `"${e.name}" = '${row.getValue(e.name)}'`)
        .join(' AND ');

      if (row.isDeleted) {
        promises.push(adapter.query(`DELETE FROM ${relation} WHERE ${pks}`));
      }

      if (row.isEdited) {
        const changes = Object.entries(row.updatedCells)
          .map(([key, value]) => value === null ? null : `"${key}" = '${value}'`)
          .filter(e => e)
          .join(', ');

          promises.push(adapter.query(`UPDATE ${relation} SET ${changes} WHERE ${pks}`));
      }

      if (row.isAdded) {
        const keys = Object.keys(row.updatedCells).filter(e => e);
        const values = keys.map(e => row.updatedCells[e]);

        const sqlKeys = keys.length === 0 ? '' : `(${keys.map(e => `"${e}"`).join(', ')})`;
        const sqlValues = values.length === 0 ? 'DEFAULT' : values.map(e => `'${e}'`).join(', ');

        promises.push(adapter.query(`INSERT INTO ${relation} ${sqlKeys} VALUES (${sqlValues})`));
      }
    });

    await Promise.all(promises);

    const cols = await loadColumns();
    const [total, reloadedRows] = await loadRows(cols, page);

    setColumns(cols);
    setTotal(total);
    setRows(reloadedRows);
    gridRef.current?.clearSelection();

    setLoadingStatus('success');
  }

  function handleDiscardChange() {
    setRows(state => {
      const newRows: Row[] = [];

      state.forEach(r => {
        if (r.isEdited || r.isDeleted) {
          const newRow = new Row(r.attributes, r.cells);
          newRow.isActive = r.isActive;
          newRow.isSelected = r.isSelected;
          newRows.push(newRow);
        } else if (!r.isAdded) {
          newRows.push(r);
        }
      });

      return newRows;
    });
  }

  const hasChanges = rows.some(e => e.hasChanges);

  return (
    <div
      className={
        classNames(
          styles.table,
          {
            hidden: !isVisible,
            focus: hasFocus,
            [styles.tableWithChanges]: hasChanges,
          },
        )
      }
      onMouseDown={onFocus}
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
              onEditCell={handleEditCell}
              onCancelEditCell={handleCancelEditCell}
              onUpdateCell={handleUpdateCell}
              onDeleteRow={handleDeleteRow}
              onAddRow={handleAddRow}
            />
          </div>

          <div className={styles.changesBanner}>
            {hasChanges && (
              <ChangesBanner
                rows={rows}
                onSave={handleSaveChange}
                onDiscard={handleDiscardChange}
              />
            )}
          </div>

          <div className={styles.footer}>
            {loadingStatus === 'reloading' && <div className={styles.spinner}>Loading...</div>}

            <a onClick={() => setExportModalVisible(true)}>Export</a>

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

      {isExportModalVisible &&
        <ExportModal
          entity={entity}
          columns={columns}
          rows={rows}
          total={total}
          page={page}
          perPage={PER_PAGE}
          onClose={() => setExportModalVisible(false)}
        />
      }

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
