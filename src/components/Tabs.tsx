import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import tabable from '../utils/tabable';
import styles from './Tabs.scss';

interface ITabsProps {
  tables: string[];
  selectedTable: string | undefined;
  onSelectTable(table: string): void;
  onCloseTable(table: string): void;
  onReorderTables(tables: string[]): void;
}

export default function Tabs(props: ITabsProps) {
  const tabsContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsContainer.current) {
      return tabable(
        tabsContainer.current,
        { drag: styles.drag, mirror: styles.mirror },
        (order) => {
          props.onReorderTables(order.map(i => props.tables[i]));
        }
      );
    }
  });

  function onCloseTable(ev: React.MouseEvent, table: string) {
    ev.preventDefault();
    ev.stopPropagation();
    props.onCloseTable(table);
  }

  return (
    <div className={styles.tabs}>
      <div ref={tabsContainer}>
        {props.tables.map(table => <span
          className={classNames(styles.tab, { [styles.selected]: table === props.selectedTable })}
          key={table}
          onMouseDown={() => props.onSelectTable(table)}
        >
          {table}
          <a
            href=""
            draggable="false"
            onMouseDownCapture={(ev) => { ev.stopPropagation(); }}
            onClick={(ev) => onCloseTable(ev, table)}
          >x</a>
        </span>)}
      </div>
    </div>
  );
}
