import React from 'react';
import classNames from 'classnames';
import styles from './Tabs.scss';

interface ITabsProps {
  tables: string[];
  selectedTable: string | undefined;
  onSelectTable(table: string): void;
  onCloseTable(table: string): void;
}

export default function Tabs(props: ITabsProps) {
  function onCloseTable(ev: React.MouseEvent, table: string) {
    ev.preventDefault();
    ev.stopPropagation();
    props.onCloseTable(table);
  }

  return (
    <div className={styles.tabs}>
      {props.tables.map(table => <span
        className={classNames(styles.tab, { [styles.selected]: table === props.selectedTable })}
        key={table}
        onClick={() => props.onSelectTable(table)}
      >
        {table}
        <a href="" onClick={(ev) => onCloseTable(ev, table)}>x</a>
      </span>)}
    </div>
  );
}
