import React, { ReactElement, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { IState } from '../../state';
import tabable from '../../utils/tabable';
import { ColumnDirection, IColumn } from '../../utils/local-store';
import { COLUMNS_ROW_HEIGHT, GUTTER_WIDTH, TableListContext } from './Table';
import TableColumn from './TableColumn';
import styles from './TableList.scss';

interface IInnerListElementProps {
  children: ReactElement;
  style: React.CSSProperties;
}

export default function TableList({ children, style }: IInnerListElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapter = useSelector((state: IState) => state.adapter);
  const localStore = useSelector((state: IState) => state.localStore);
  const { entity, columns, setColumns } = useContext(TableListContext);

  const saveColumnSettings = debounce((cols: IColumn[]) => {
    localStore.setColumnsSettings(adapter.connection.uuid, entity.id, cols);
  }, 500);

  useEffect(() => {
    if (containerRef.current) {
      return tabable({
        container: containerRef.current,
        cssClass: { drag: styles.tableListHeaderColumnDrag },
        manageTabWidth: false,
        onReorder: (order) => {
          const reorderedColumns = order.map(i => columns[i]);
          setColumns(reorderedColumns);
          saveColumnSettings(reorderedColumns);
        },
      });
    }

    return undefined;
  }, [columns]);

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

  const setColumnOrder = (column: IColumn, direction: ColumnDirection) => {
    const newColumns: IColumn[] = [];
    let position = column.order.position;

    if (direction === ColumnDirection.NONE) {
      columns.forEach(col => {
        if (col === column) {
          newColumns.push({ ...col, order: { ...col.order, direction, position: 0 } });
        } else {
          let colPosition = col.order.position;
          if (col.order.position > position) colPosition = col.order.position - 1;
          newColumns.push({ ...col, order: { ...col.order, position: colPosition } });
        }
      });
    } else {
      if (position === 0) position = Math.max(...columns.map(el => el.order.position)) + 1;

      columns.forEach(col => {
        if (col === column) {
          newColumns.push({ ...col, order: { ...col.order, direction, position } });
        } else {
          newColumns.push(col);
        }
      });
    }

    setColumns(newColumns);
    saveColumnSettings(newColumns);
  }

  const height = parseFloat(String(style.height)) + COLUMNS_ROW_HEIGHT;
  const width = columns.reduce((acc, col) => acc + col.width, 0);

  return (
    <div style={{ ...style, height }}>
      <div style={{ height: COLUMNS_ROW_HEIGHT }} className={styles.tableListHeader}>
        <div style={{ width: GUTTER_WIDTH }} className={styles.tableListHeaderGutter}></div>
        <div ref={containerRef} style={{ width }} className={styles.columnsContainer}>
          {columns.map(column =>
            <TableColumn
              key={column.name}
              column={column}
              showOrderNumber={Math.max(...columns.map(e => e.order.position)) > 1}
              onResize={(width) => setColumnWidth(column, width)}
              onReorder={(direction) => setColumnOrder(column, direction)}
            />
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
