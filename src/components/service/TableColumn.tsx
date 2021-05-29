import React, { useEffect, useRef } from 'react';
import { IColumn } from "../../utils/local-store";
import resizable from '../../utils/resizable';
import styles from './TableColumn.scss';

interface ITableColumnProps {
  column: IColumn;
  onResize: (width: number) => void;
}

export default function TableColumn({ column, onResize }: ITableColumnProps) {
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (container.current && trigger.current) {
      return resizable(container.current, trigger.current, onResize);
    }

    return undefined;
  });

  return (
    <div
      ref={container}
      style={{ width: column.width }}
      className={styles.tableColumn}
    >
      <span className={styles.content}>{column.name}</span>
      <span ref={trigger} className={styles.resizer}></span>
    </div>
  );
}
