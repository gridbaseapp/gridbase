import React, { ReactElement, useContext, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  LayoutMeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { IState } from '../../state';
import { ColumnDirection, IColumn } from '../../utils/local-store';
import { COLUMNS_ROW_HEIGHT, GUTTER_WIDTH, TableListContext } from './Table';
import { SortableTableColumn, TableColumn } from './TableColumn';
import styles from './TableList.scss';

interface IInnerListElementProps {
  children: ReactElement;
  style: React.CSSProperties;
}

export default function TableList({ children, style }: IInnerListElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapter = useSelector((state: IState) => state.adapter);
  const localStore = useSelector((state: IState) => state.localStore);
  const { entity, columns, setColumns, onSelectColumn } = useContext(TableListContext);
  const [activeColumn, setActiveColumn] = useState<IColumn | null>(null);
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 1 },
  });
  const sensors = useSensors(pointerSensor);

  const saveColumnSettings = debounce((cols: IColumn[]) => {
    localStore.setColumnsSettings(adapter.connection.uuid, entity.id, cols);
  }, 500);

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

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const col = columns.find(el => el.name === active.id);

    if (col) setActiveColumn(col);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveColumn(null);

    if (over && active.id !== over.id) {
      setColumns(columns => {
        const oldIndex = columns.findIndex(col => col.name === active.id);
        const newIndex = columns.findIndex(col => col.name === over.id);

        const newArray = arrayMove(columns, oldIndex, newIndex);

        saveColumnSettings(newArray);
        return newArray;
      });
    }
  }

  const height = parseFloat(String(style.height)) + COLUMNS_ROW_HEIGHT;
  const width = columns
    .filter(column => column.visible)
    .reduce((acc, col) => acc + col.width, 0);

  return (
    <div style={{ ...style, height }}>
      <div style={{ height: COLUMNS_ROW_HEIGHT }} className={styles.tableListHeader}>
        <div style={{ width: GUTTER_WIDTH }} className={styles.tableListHeaderGutter}></div>
        <div ref={containerRef} style={{ width }} className={styles.columnsContainer}>
          <DndContext
            layoutMeasuring={{ strategy: LayoutMeasuringStrategy.Always }}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
            sensors={sensors}
            autoScroll={{ threshold: { x: 0.2, y: 0 } }}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <SortableContext
              items={columns.filter(column => column.visible).map(e => e.name)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.filter(column => column.visible).map(column =>
                <SortableTableColumn
                  key={column.name}
                  column={column}
                  showOrderNumber={Math.max(...columns.map(e => e.order.position)) > 1}
                  onResize={(width) => setColumnWidth(column, width)}
                  onReorder={(direction) => setColumnOrder(column, direction)}
                  onSelectColumn={onSelectColumn}
                />
              )}
            </SortableContext>
            {createPortal(
              <DragOverlay>
                {activeColumn && <TableColumn
                  column={activeColumn}
                  showOrderNumber={Math.max(...columns.map(e => e.order.position)) > 1}
                />}
              </DragOverlay>, document.body)}
          </DndContext>
        </div>
      </div>

      {children}
    </div>
  );
};
