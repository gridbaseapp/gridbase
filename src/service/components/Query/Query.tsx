import React, { useEffect, useState, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { editor } from 'monaco-editor';
import Tippy from '@tippyjs/react/headless';
import { Column, Entity, Row, SqlQuery } from '../../types';
import styles from './Query.scss';
import { useServiceContext, useServiceStash } from '../../hooks';
import { SaveAs } from './SaveAs';
import { useFocus, useHotkey, useElementSize, useResizable } from '../../../app/hooks';
import { Grid, GridRef } from '../Grid';
import { COLUMN_MIN_WIDTH, COLUMN_MAX_WIDTH } from '../Table/constants';

type LoadingStatus = 'loading' | 'success';
type QueryExecutionStatus = 'running' | 'success';

interface Props {
  entity: Entity;
  isVisible: boolean;
  hasFocus: boolean;
  onFocus(): void;
}

export function Query({ entity, isVisible, hasFocus, onFocus }: Props) {
  const [gridContainerRef, gridSize] = useElementSize();

  const { connection, adapter, setEntities } = useServiceContext();

  const [
    loadSqlQueries,
    saveSqlQueries,
  ] = useServiceStash<SqlQuery[]>(`queries.${entity.schema.id}`, []);

  const [editorSectionHeight, setEditorSectionHeight] = useState(200);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('loading');
  const [query, setQuery] = useState<SqlQuery | null>(null);
  const [isSaveAsVisible, setSaveAsVisible] = useState(false);
  const [columns, setColumns] = useState<Column[]>([])
  const [rows, setRows] = useState<any[]>([]);
  const [
    queryExecutionStatus,
    setQueryExecutionStatus,
  ] = useState<QueryExecutionStatus>('success');
  const [
    queryExecutionError,
    setQueryExecutionError,
  ] = useState<string | null>(null);

  const gridRef = useRef<GridRef>(null);

  const sqlInitialValue = useRef('');
  const editorInstance = useRef<editor.IStandaloneCodeEditor | null>(null);

  const {
    resizableElementRef,
    resizableTrigger,
  } = useResizable<HTMLDivElement>(({ height }) => {
    setEditorSectionHeight(height);

    if (editorInstance.current) {
      editorInstance.current.layout();
    }
  }, { direction: 'row' });

  useEffect(() => {
    setLoadingStatus('loading');

    const queries = loadSqlQueries();
    let query = queries.find(e => e.id === entity.id);

    if (!query) {
      query = { id: entity.id, name: entity.name, sql: '' };
    }

    sqlInitialValue.current = query.sql;
    setQuery(query);
    setLoadingStatus('success');
  }, []);

  const setEditorRef = useCallback(ref => {
    if (ref) {
      const instance = editor.create(ref, {
        value: '',
        language: 'pgsql',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      });

      editorInstance.current = instance;
      editorInstance.current.onDidChangeModelContent(() => {
        const sql = editorInstance.current!.getValue();
        setQuery(state => ({ ...state!, sql }));

        if (sql !== sqlInitialValue.current && entity.status === 'fresh') {
          setEntities(state => {
            if (!state) return;

            const i = state.findIndex(e => e.id === entity.id);

            return [
              ...state.slice(0, i),
              { ...entity, status: 'unsaved' },
              ...state.slice(i + 1),
            ];
          });
        }

      });
    } else {
      if (editorInstance.current) {
        editorInstance.current.dispose();
        editorInstance.current = null;
      }
    }
  }, []);

  const isEditorHydrated = useRef(false);
  useEffect(() => {
    if (editorInstance.current && query && !isEditorHydrated.current) {
      editorInstance.current.setValue(query.sql);
      isEditorHydrated.current = true;
    }
  }, [query]);

  const name = `Query-${connection.uuid}-${entity.id}`;
  const scopes = [`Service-${connection.uuid}`, name]

  useFocus(name, hasFocus);

  useHotkey(scopes, 'meta+s', () => {
    if (query && entity.status === 'unsaved') saveQuery(query);
  }, [query, entity]);

  useHotkey(scopes, 'meta+r', () => {
    runQuery();
  }, [query]);

  function saveQuery(query: SqlQuery) {
    const queries = loadSqlQueries();
    let idx = queries.findIndex(e => e.id === entity.id);

    if (idx > -1) {
      queries[idx] = query;
    } else {
      queries.push(query);
    }

    saveSqlQueries(queries);
    sqlInitialValue.current = query.sql;
    setQuery(query);
    setEntities(state => {
      if (!state) return;

      const i = state.findIndex(e => e.id === entity.id);

      return [
        ...state.slice(0, i),
        { ...entity, name: query.name, status: 'fresh' },
        ...state.slice(i + 1),
      ];
    });
  }

  function handleClickSave(ev: React.MouseEvent) {
    ev.preventDefault();

    if (entity.status === 'new') {
      setSaveAsVisible(true);
    } else {
      saveQuery(query!);
    }
  }

  function handleClickSaveAs(name: string) {
    saveQuery({ ...query!, name });
    setSaveAsVisible(false);
  }

  function handleClickOutside() {
    setSaveAsVisible(false);
  }

  async function runQuery() {
    if (!query) return;

    try {
      setQueryExecutionStatus('running');

      const { fields, rows } = await adapter.queryNoTypeCasting(query.sql);
      const columns: Column[] = fields.map(e => ({
        name: e.name,
        isVisible: true,
        width: 100,
        sort: { position: 0, order: 'none' },
      }));

      setColumns(columns);
      setRows(rows.map(e => new Row(e)));
      gridRef.current?.clearSelection();

      setQueryExecutionError(null);
      setQueryExecutionStatus('success');
    } catch (error) {
      setQueryExecutionError((error as Error).message);
    }
  }

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
      className={classNames(styles.query, { hidden: !isVisible, focus: hasFocus })}
      onClick={onFocus}
    >
      {loadingStatus === 'loading' && <div className={styles.splash}>Loading...</div>}

      {loadingStatus === 'success' && query && (
        <div className={styles.content}>
          <div
            ref={resizableElementRef}
            className={styles.editorSection}
            style={{ height: editorSectionHeight }}
          >
            <div className={styles.editor} ref={setEditorRef}></div>
            <div
              className={styles.resizer}
              onMouseDown={resizableTrigger}
            ></div>
          </div>

          <div className={styles.result}>
            <div ref={gridContainerRef} className={styles.grid}>
              {queryExecutionError}
              {!queryExecutionError && (
                <Grid
                  ref={gridRef}
                  scopes={scopes}
                  width={gridSize.width}
                  height={gridSize.height}
                  columns={columns}
                  rows={rows}
                  onResizeColumn={handleResizeColumn}
                  onSortColumns={setColumns}
                  onSelectRows={handleSelectRows}
                />
              )}
            </div>

            <div className={styles.controllPanel}>
              {queryExecutionStatus === 'running' && 'Running...'}
              {queryExecutionStatus === 'success' && (
                <>
                  <a onClick={runQuery}>Run</a>
                  {(entity.status === 'new' || entity.status === 'unsaved') && (
                    <Tippy
                      placement="top-start"
                      interactive
                      visible={isSaveAsVisible}
                      onClickOutside={handleClickOutside}
                      render={() => isSaveAsVisible && <SaveAs onSave={handleClickSaveAs} />}
                    >
                      <a onClick={handleClickSave}>Save</a>
                    </Tippy>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
