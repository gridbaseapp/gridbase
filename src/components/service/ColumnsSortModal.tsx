import React, { ChangeEvent, forwardRef, useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  LayoutMeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { ColumnDirection, IColumn } from '../../utils/local-store';
import styles from './ColumnsSortModal.scss';

interface ISortColumn {
  name: string;
  enabled: boolean;
  direction: ColumnDirection;
  position: number;
}

interface IColumnsSortModalProps {
  columns: IColumn[];
  onClose: () => void;
  onApply: (columns: IColumn[]) => void;
}

interface ISortableItemProps {
  column: ISortColumn;
  className?: string;
  onChangeEnabled?: (column: ISortColumn) => void;
  onChangeDirection?: (column: ISortColumn, direction: ColumnDirection) => void;
  listeners?: any;
  attributes?: any;
  style?: any;
}

const Item = forwardRef<HTMLDivElement, ISortableItemProps>((props, ref) => {
  const {
    column,
    onChangeEnabled,
    onChangeDirection,
    listeners,
    attributes,
    className,
    ...rest
  } = props;

  const handleChangeDirection = (ev: ChangeEvent<HTMLSelectElement>) => {
    if (onChangeDirection) onChangeDirection(column, ev.target.value as ColumnDirection);
  }

  return (
    <div ref={ref} {...rest} className={classNames(styles.item, className)}>
      <span {...listeners} {...attributes}>&#8597;</span>
      <span>
        <input
          type="checkbox"
          checked={column.enabled}
          onChange={() => onChangeEnabled && onChangeEnabled(column)}
        />
      </span>
      <span>{column.name}</span>
      <span>
        <select
          value={column.direction}
          onChange={handleChangeDirection}
          disabled={!column.enabled}
        >
          <option value={ColumnDirection.ASC}>{ColumnDirection.ASC}</option>
          <option value={ColumnDirection.DESC}>{ColumnDirection.DESC}</option>
        </select>
      </span>
      <span>{column.position + 1}</span>
    </div>
  );
});

function SortableItem({ column, onChangeEnabled, onChangeDirection }: ISortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id: column.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const css = classNames({
    [styles.dragging]: isDragging,
    [styles.sorting]: isSorting,
    [styles.disabled]: !column.enabled,
  });

  return (
    <Item
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      onChangeEnabled={onChangeEnabled}
      onChangeDirection={onChangeDirection}
      className={css}
      column={column}
    />
  );
}

export default function ColumnsSortModal(props: IColumnsSortModalProps) {
  const [columns, setColumns] = useState<ISortColumn[]>([]);
  const [activeColumn, setActiveColumn] = useState<ISortColumn | null>(null);

  useEffect(() => {
    const enabled: ISortColumn[] = [];
    const disabled: ISortColumn[] = [];

    [...props.columns]
      .sort((a, b) => a.order.position - b.order.position)
      .filter(e => e.visible)
      .forEach(col => {
        const isEnabled = col.order.position > 0;

        const newCol = {
          name: col.name,
          enabled: isEnabled,
          direction: isEnabled ? col.order.direction : ColumnDirection.ASC,
          position: 0,
        };

        newCol.enabled ? enabled.push(newCol) : disabled.push(newCol);
      });

    enabled.forEach((el, i) => el.position = i);
    disabled.forEach((el, i) => el.position = enabled.length + i);

    setColumns([...enabled, ...disabled]);
  }, []);

  const onChangeEnabled = (column: ISortColumn) => {
    setColumns(columns => {
      const enabled: ISortColumn[] = [];
      const disabled: ISortColumn[] = [];

      columns.forEach(col => {
        let newCol: ISortColumn;

        if (col === column) {
          newCol = { ...col, enabled: !col.enabled };
        } else {
          newCol = { ...col };
        }

        newCol.enabled ? enabled.push(newCol) : disabled.push(newCol);
      });

      enabled.forEach((el, i) => el.position = i);
      disabled.forEach((el, i) => el.position = enabled.length + i);

      return [...enabled, ...disabled];
    });
  };

  const onChangeDirection = (column: ISortColumn, direction: ColumnDirection) => {
    setColumns(columns => {
      return columns.map(col => {
        let newCol: ISortColumn;

        if (col === column) {
          newCol = { ...col, direction: direction };
        } else {
          newCol = { ...col };
        }

        return newCol;
      });
    });
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const col = columns.find(el => el.name === active.id);

    if (col) setActiveColumn(col);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveColumn(null);

    if (over && active.id !== over.id) {
      setColumns((columns) => {
        const oldIndex = columns.findIndex(col => col.name === active.id);
        const newIndex = columns.findIndex(col => col.name === over.id);

        const newArray = arrayMove(columns, oldIndex, newIndex);
        newArray.forEach((el, i) => el.position = i);

        return newArray;
      });
    }
  }

  const handleApply = (ev: React.MouseEvent) => {
    ev.preventDefault();

    const newColumns: IColumn[] = [];

    props.columns.forEach(column => {
      const col = columns.find(el => el.name === column.name);

      if (col) {
        const position = col.enabled ? col.position + 1 : 0;
        newColumns.push({
          ...column,
          order: {
            direction: col.enabled ? col.direction : ColumnDirection.NONE,
            position,
          },
        });
      } else {
        newColumns.push({ ...column });
      }
    });

    props.onApply(newColumns);
  }

  return (
    <div className={styles.backdrop} onClick={props.onClose}>
      <div className={styles.modal} onClick={ev => ev.stopPropagation()}>
        <div className={styles.header}>
          <a href="" onClick={handleApply}>apply</a>
          <a href="" onClick={ev => {ev.preventDefault(); props.onClose()}}>close</a>
        </div>

        <div className={styles.columnsHeader}>
          <span></span>
          <span>Enabled</span>
          <span>Column</span>
          <span>Order</span>
          <span>Position</span>
        </div>

        <div className={styles.content}>
          <div className={styles.scrollableContainer}>
            <DndContext
              layoutMeasuring={{ strategy: LayoutMeasuringStrategy.Always }}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <SortableContext
                items={columns.filter(el => el.enabled).map(e => e.name)}
                strategy={verticalListSortingStrategy}
              >
                {columns.filter(el => el.enabled).map(column =>
                  <SortableItem
                    key={column.name}
                    column={column}
                    onChangeEnabled={onChangeEnabled}
                    onChangeDirection={onChangeDirection}
                  />
                )}
              </SortableContext>
              <DragOverlay>
                {activeColumn && <Item column={activeColumn} className={styles.overlayItem} />}
              </DragOverlay>
            </DndContext>
          </div>
          <div>
            {columns.filter(el => !el.enabled).map(column =>
              <SortableItem
                key={column.name}
                column={column}
                onChangeEnabled={onChangeEnabled}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
