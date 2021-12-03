import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResizable } from '../../../app/hooks';
import { useGridContext } from '../../hooks';
import { Column, SortOrder } from '../../types';
import styles from './HeaderCell.scss';

const ORDER_TRANSITION = {
  'none': 'asc',
  'asc': 'desc',
  'desc': 'none',
}

interface SortableHeaderCellProps {
  column: Column;
}

export function SortableHeaderCell(props: SortableHeaderCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.column.name });

  return (
    <HeaderCell
      ref={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      transform={transform}
      transition={transition}
      isDragging={isDragging}
      {...props}
    />
  );
}

interface HeaderCellProps {
  column: Column;
  attributes?: any;
  listeners?: any;
  transform?: any;
  transition?: any;
  isDragging?: boolean;
}

export const HeaderCell = forwardRef<HTMLDivElement, HeaderCellProps>(({
  column,
  attributes,
  listeners,
  transform,
  transition,
  isDragging = false,
}, ref) => {
  const { columns, onResizeColumn, onReorderColumn } = useGridContext();

  const {
    resizableElementRef,
    resizableTrigger,
  } = useResizable<HTMLDivElement>(({ width }) => {
    onResizeColumn(column, width);
  });

  function setNodeRef(node: HTMLDivElement) {
    resizableElementRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }

  function handleOrder(ev: React.MouseEvent) {
    ev.preventDefault();

    if (onReorderColumn) {
      onReorderColumn(column, ORDER_TRANSITION[column.sort.order] as SortOrder);
    }
  }

  const css = classNames(
    styles.headerCell,
    {
      [styles.dragging]: isDragging,
    }
  );

  const orderCss = classNames(
    styles.order,
    { [styles.orderHoverable]: column.sort.order === 'none' },
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: column.width,
  };

  const isPositionVisible = Math.max(...columns.map(e => e.sort.position)) > 1

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={css}
    >
      <span className={styles.title}>
        {column.name}
      </span>

      <a
        draggable="false"
        className={orderCss}
        onClick={handleOrder}
        onPointerDown={ev => ev.stopPropagation()}
      >
        {isPositionVisible && column.sort.position > 0 &&
          <span>{column.sort.position}</span>
        }
        {column.sort.order === 'none' && <span>&#8597;</span>}
        {column.sort.order === 'asc' && <span>&darr;</span>}
        {column.sort.order === 'desc' && <span>&uarr;</span>}
      </a>

      <span
        className={styles.resizer}
        onMouseDown={resizableTrigger}
        onPointerDown={ev => ev.stopPropagation()}
      ></span>
    </div>
  );
});
