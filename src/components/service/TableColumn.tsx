import React, { forwardRef, useEffect, useRef } from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { IColumn } from "../../utils/local-store";
import resizable from '../../utils/resizable';
import { ColumnDirection } from '../../utils/local-store';
import styles from './TableColumn.scss';

interface ITableColumnProps {
  column: IColumn;
  showOrderNumber: boolean;
  className?: string;
  onResize?: (width: number) => void;
  onReorder?: (direction: ColumnDirection) => void;
  onSelectColumn?: (column: string, mode: string) => void;
  listeners?: any;
  attributes?: any;
  style?: any;
}

const DIRECTION_TRANSITIONING = {
  [ColumnDirection.NONE]: ColumnDirection.ASC,
  [ColumnDirection.ASC]: ColumnDirection.DESC,
  [ColumnDirection.DESC]: ColumnDirection.NONE,
}

export const TableColumn = forwardRef<HTMLDivElement, ITableColumnProps>((props, ref) => {
  const {
    column,
    listeners,
    attributes,
    className,
    style,
    showOrderNumber,
    onReorder,
    onResize,
    onSelectColumn,
    ...rest
  } = props;

  const target = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (target.current && trigger.current && onResize) {
      return resizable(target.current, trigger.current, onResize);
    }

    return undefined;
  });

  const handleReorder = (ev: React.MouseEvent) => {
    ev.preventDefault();

    if (onReorder) {
      onReorder(DIRECTION_TRANSITIONING[props.column.order.direction]);
    }
  }

  const handleSelect = (ev: React.MouseEvent) => {
    if (onSelectColumn) {
      let mode = 'select';
      if (ev.metaKey) mode = 'add';
      if (ev.shiftKey) mode = 'range';
      onSelectColumn(column.name, mode);
    }
  }

  const cls = classNames(
    styles.reorder,
    { [styles.reorderNone]: props.column.order.direction === ColumnDirection.NONE },
  );

  return (
    <div
      ref={node => {
        target.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      style={{ ...style, width: props.column.width }}
      className={classNames(styles.tableColumn, className)}
      {...listeners}
      {...attributes}
      {...rest}
    >
      <span
        className={styles.content}
        onClick={handleSelect}
      >
        {props.column.name}
      </span>

      <a
        href=""
        draggable="false"
        className={cls}
        onClick={handleReorder}
        onPointerDown={ev => ev.stopPropagation()}
      >
        {props.column.order.position > 0 && showOrderNumber &&
          <span>{props.column.order.position}</span>
        }
        {props.column.order.direction === ColumnDirection.NONE && <span>&#8597;</span>}
        {props.column.order.direction === ColumnDirection.ASC && <span>&darr;</span>}
        {props.column.order.direction === ColumnDirection.DESC && <span>&uarr;</span>}
      </a>

      <span
        ref={trigger}
        className={styles.resizer}
        onPointerDown={ev => ev.stopPropagation()}
      ></span>
    </div>
  );
});

export function SortableTableColumn(props: ITableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.column.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const css = classNames({
    [styles.dragging]: isDragging,
  });

  return (
    <TableColumn
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      className={css}
      column={props.column}
      showOrderNumber={props.showOrderNumber}
      onReorder={props.onReorder}
      onResize={props.onResize}
      onSelectColumn={props.onSelectColumn}
    />
  );
}
