import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import tabable from '../../utils/tabable';
import AutoSizer from './../AutoSizer';
import { IEntity, IState } from '../../state';
import { IColumn } from '../../utils/local-store';
import TableColumn from './TableColumn';
import Pagination from './Padination';
import styles from './Table.scss';

interface ITableProps {
  visible: boolean;
  entity: IEntity;
}

interface IInnerListElementProps {
  children: ReactElement;
  style: React.CSSProperties;
}

const COLUMNS_ROW_HEIGHT = 30;
const GUTTER_WIDTH = 30;
const DEFAULT_COLUMN_WIDTH = 100;
const ITEM_HEIGHT = 20;

const PER_PAGE = 1000;

export default function Table(props: ITableProps) {
  const listRef = useRef<FixedSizeList>(null);
  const adapter = useSelector((state: IState) => state.adapter);
  const localStore = useSelector((state: IState) => state.localStore);
  const [page, setPage] = useState<number>(1);
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
          cols.push({ ...attr, width: DEFAULT_COLUMN_WIDTH });
        }
      });

      setColumns(cols);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const schema = props.entity.schema?.name;
      const table = props.entity.name;

      const [total, rows] = await Promise.all([
        adapter.query(`SELECT count(*) FROM "${schema}"."${table}"`),
        adapter.query(
          `SELECT * FROM "${schema}"."${table}" LIMIT ${PER_PAGE} OFFSET ${(page - 1) * PER_PAGE}`
        ),
      ]);

      setTotalRecords(total.rows[0].count);
      setRows(rows.rows);
      if (listRef.current) listRef.current.scrollToItem(0);
    })();
  }, [page]);

  const saveColumnSettings = debounce((cols: IColumn[]) => {
    localStore.setColumnsSettings(adapter.connection.uuid, props.entity.id, cols);
  }, 500);

  const InnerListElement = ({ children, style }: IInnerListElementProps) => {
    const colsContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (colsContainer.current) {
        return tabable({
          container: colsContainer.current,
          cssClass: { drag: styles.tableHeaderColumnDrag },
          manageTabWidth: false,
          onReorder: (order) => {
            const reorderedColumns = order.map(i => columns[i]);
            setColumns(reorderedColumns);
            saveColumnSettings(reorderedColumns);
          },
        })
      }

      return undefined;
    }, []);

    const setColumnWidth = (column: IColumn, width: number) => {
      const newColumns: IColumn[] = [];

      columns.forEach(col => {
        if (col === column) {
          newColumns.push({ ...col, width });
        } else {
          newColumns.push(col);
        }
      });

      setColumns(newColumns);
      saveColumnSettings(newColumns);
    }

    const height = parseFloat(style.height as string) + COLUMNS_ROW_HEIGHT;
    const width = columns.reduce((acc, col) => acc + col.width, 0);

    return (
      <div style={{ ...style, height }}>
        <div style={{ height: COLUMNS_ROW_HEIGHT }} className={styles.tableHeader}>
          <div style={{ width: GUTTER_WIDTH }} className={styles.tableHeaderGutter}></div>
          <div ref={colsContainer} style={{ width }} className={styles.columnsContainer}>
            {columns.map(column =>
              <TableColumn
                key={column.name}
                column={column}
                onResize={(width) => setColumnWidth(column, width)}
              />
            )}
          </div>
        </div>

        {children}
      </div>
    );
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    const top = parseFloat(style.top as string) + COLUMNS_ROW_HEIGHT;
    const cls = classNames(styles.tableRow, index % 2 ? styles.tableRowEven : null);
    const row = rows[index];

    return (
      <div style={{ ...style, top, width: 'auto' }} className={cls}>
        <div style={{ width: GUTTER_WIDTH }} className={styles.tableRowGutter}></div>
        {columns.map(column =>
          <div
            key={`${index}-${column.name}`}
            style={{ width: column.width }}
            className={styles.tableRowColumn}
          >
            {row && row[column.name].toString()}
          </div>
        )}
      </div>
    );
  };

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
              <FixedSizeList
                ref={listRef}
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
