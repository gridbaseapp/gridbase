import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { IColumn } from "../../utils/local-store";
import resizable from '../../utils/resizable';
import { ColumnDirection } from '../../utils/local-store';
import styles from './TableColumn.scss';

interface ITableColumnProps {
  column: IColumn;
  showOrderNumber: boolean;
  onResize: (width: number) => void;
  onReorder: (direction: ColumnDirection) => void;
}

const DIRECTION_TRANSITIONING = {
  [ColumnDirection.NONE]: ColumnDirection.ASC,
  [ColumnDirection.ASC]: ColumnDirection.DESC,
  [ColumnDirection.DESC]: ColumnDirection.NONE,
}

export default React.memo(function TableColumn(props: ITableColumnProps) {
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (container.current && trigger.current) {
      return resizable(container.current, trigger.current, props.onResize);
    }

    return undefined;
  });

  const onMouseDownCapture = (ev: React.MouseEvent) => {
    ev.stopPropagation();
  }

  const onReorder = (ev: React.MouseEvent) => {
    ev.preventDefault();
    props.onReorder(DIRECTION_TRANSITIONING[props.column.order.direction]);
  }

  const cls = classNames(
    styles.reorder,
    { [styles.reorderNone]: props.column.order.direction === ColumnDirection.NONE },
  );

  return (
    <div
      ref={container}
      style={{ width: props.column.width }}
      className={styles.tableColumn}
    >
      <span className={styles.content}>{props.column.name}</span>

      <a
        href=""
        draggable="false"
        className={cls}
        onClick={onReorder}
        onMouseDownCapture={onMouseDownCapture}
      >
        {props.column.order.position > 0 && props.showOrderNumber &&
          <span>{props.column.order.position}</span>
        }
        {props.column.order.direction === ColumnDirection.NONE && <span>&#8597;</span>}
        {props.column.order.direction === ColumnDirection.ASC && <span>&darr;</span>}
        {props.column.order.direction === ColumnDirection.DESC && <span>&uarr;</span>}
      </a>

      <span ref={trigger} className={styles.resizer}></span>
    </div>
  );
})
