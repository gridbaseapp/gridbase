import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { inTheMiddle } from '../../../CollisionDetection';
import { useGridContext } from '../../hooks';
import { HeaderCell, SortableHeaderCell } from './HeaderCell';
import styles from './Header.scss';
import { HEADER_HEIGHT, GUTTER_WIDTH } from './constants';
import { Column } from '../../types';

export function Header() {
  const { columns, rows, onSortColumns, selectRow } = useGridContext();

  const [focusedColumn, setFocusedColumn] = useState<Column | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 1 },
  });
  const sensors = useSensors(pointerSensor);

  function handleDragStart({ active }: DragStartEvent) {
    const column = columns.find(el => el.name === active.id);
    if (column) setFocusedColumn(column);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setFocusedColumn(null);

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex(e => e.name === active.id);
      const newIndex = columns.findIndex(e => e.name === over.id);

      const reordered = arrayMove(columns, oldIndex, newIndex);

      onSortColumns(reordered);
    }
  }

  function handleClickGutter() {
    selectRow(0, 'select');
    selectRow(rows.length - 1, 'range');
  }

  const visibleColumns = columns.filter(e => e.isVisible);

  return (
    <div className={styles.header} style={{ height: HEADER_HEIGHT }} onMouseDown={ev => ev.stopPropagation()}>
      <div
        style={{ width: GUTTER_WIDTH }}
        className={styles.gutter}
        onClick={handleClickGutter}
      ></div>
      <div className={styles.columns}>
        <DndContext
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          collisionDetection={inTheMiddle}
          modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
          sensors={sensors}
          autoScroll={{ threshold: { x: 0.1, y: 0 } }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleColumns.map(e => e.name)}
            strategy={horizontalListSortingStrategy}
          >
            {visibleColumns.map(column => (
              <SortableHeaderCell
                key={column.name}
                column={column}
              />
            ))}
          </SortableContext>

          {createPortal(
            <DragOverlay>
              {focusedColumn && <HeaderCell column={focusedColumn} />}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>
    </div>
  );
}
