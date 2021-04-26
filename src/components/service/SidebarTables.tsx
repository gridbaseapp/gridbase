import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import styles from './SidebarTables.scss';
import { IState } from '../store';

interface ISidebarTablesProps {
  selectedSchema: string;
  selectedTable: string | undefined;
  onOpenTable(table: string): void;
}

export default function SidebarTables(props: ISidebarTablesProps) {
  const connection = useSelector((state: IState) => state.connection);
  const [tables, setTables] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function run() {
      const { rows } = await connection.client.query(`
        SELECT c.relname AS name
        FROM pg_catalog.pg_class c
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind IN ('r', 'p', '') AND n.nspname = '${props.selectedSchema}'
        ORDER BY c.relname;
      `);

      setTables(rows.map(e => e.name));
    }

    run();
  }, [props.selectedSchema]);

  function onOpenTable(ev: React.MouseEvent, table: string) {
    ev.preventDefault();
    props.onOpenTable(table);
  }

  function onFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function filteredTables() {
    if (filter.length === 0) return tables;
    return tables.filter(e => e.includes(filter));
  }

  return (
    <div className={styles.sidebarTables}>
      <div className={styles.list}>
        {filteredTables().map(table => <a
          href=""
          className={classNames({ [styles.selected]: table === props.selectedTable})}
          key={table}
          onClick={(ev) => ev.preventDefault()}
          onDoubleClick={(ev) => onOpenTable(ev, table)}
        >
          {table}
        </a>)}
      </div>

      <div>
        <input
          className={styles.filter}
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={onFilter}
        />
      </div>
    </div>
  );
}
