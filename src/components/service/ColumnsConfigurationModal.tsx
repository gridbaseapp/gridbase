import React, { useEffect, useState, forwardRef } from 'react';
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
import styles from './ColumnsConfigurationModal.scss';

interface IConfigColumn extends IColumn {
  position: number;
}

interface IColumnsConfigurationModalProps {
  columns: IColumn[];
  onClose: () => void;
  onApply: (columns: IColumn[]) => void;
}

interface ISortableItemProps {
  column: IConfigColumn;
  className?: string;
  onChangeVisible?: (column: IConfigColumn) => void;
  listeners?: any;
  attributes?: any;
  style?: any;
}

const Item = forwardRef<HTMLDivElement, ISortableItemProps>((props, ref) => {
  const { column, onChangeVisible, listeners, attributes, className, ...rest } = props;

  return (
    <div ref={ref} {...rest} className={classNames(styles.item, className)}>
      <span {...listeners} {...attributes}>&#8597;</span>
      <span>
        <input
          type="checkbox"
          checked={column.visible}
          onChange={() => onChangeVisible && onChangeVisible(column)}
        />
      </span>
      <span>{column.name}</span>
      <span>{column.position + 1}</span>
    </div>
  );
});

function SortableItem({ column, onChangeVisible }: ISortableItemProps) {
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
    [styles.disabled]: !column.visible,
  });

  return (
    <Item
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      onChangeVisible={onChangeVisible}
      className={css}
      column={column}
    />
  );
}

export default function ColumnsConfigurationModal(props: IColumnsConfigurationModalProps) {
  const [columns, setColumns] = useState<IConfigColumn[]>([]);
  const [activeColumn, setActiveColumn] = useState<IConfigColumn | null>(null);

  useEffect(() => {
    const enabled: IConfigColumn[] = [];
    const disabled: IConfigColumn[] = [];

    props.columns.forEach(col => {
      const newCol = { ...col, position: 0 };
      col.visible ? enabled.push(newCol) : disabled.push(newCol);
    });

    enabled.forEach((el, i) => el.position = i);
    disabled.forEach((el, i) => el.position = enabled.length + i);

    setColumns([...enabled, ...disabled]);
  }, []);

  const onChangeVisible = (column: IConfigColumn) => {
    setColumns(columns => {
      const enabled: IConfigColumn[] = [];
      const disabled: IConfigColumn[] = [];

      columns.forEach(col => {
        let newCol: IConfigColumn;

        if (col === column) {
          newCol = { ...col, visible: !col.visible };
        } else {
          newCol = { ...col };
        }

        newCol.visible ? enabled.push(newCol) : disabled.push(newCol);
      });

      enabled.forEach((el, i) => el.position = i);
      disabled.forEach((el, i) => el.position = enabled.length + i);

      return [...enabled, ...disabled];
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

    const newColumns = columns.map(col => {
      if (!col.visible) {
        return {
          ...col,
          order: { ...col.order, direction: ColumnDirection.NONE, position: 0 },
          position: undefined,
        };
      } else {
        return { ...col, position: undefined };
      }
    });

    newColumns
      .map(e => e.order)
      .filter(e => e.position > 0)
      .sort((a, b) => a.position - b.position)
      .forEach((e, i) => e.position = i + 1);

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
          <span>Visible</span>
          <span>Column</span>
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
                items={columns.filter(el => el.visible).map(e => e.name)}
                strategy={verticalListSortingStrategy}
              >
                {columns.filter(el => el.visible).map(column =>
                  <SortableItem
                    key={column.name}
                    column={column}
                    onChangeVisible={onChangeVisible}
                  />
                )}
              </SortableContext>
              <DragOverlay>
                {activeColumn && <Item column={activeColumn} className={styles.overlayItem} />}
              </DragOverlay>
            </DndContext>
          </div>
          <div>
            {columns.filter(el => !el.visible).map(column =>
              <SortableItem
                key={column.name}
                column={column}
                onChangeVisible={onChangeVisible}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
