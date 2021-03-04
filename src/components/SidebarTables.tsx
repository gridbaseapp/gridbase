import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IConnection } from '../connection';
import styles from './SidebarTables.scss';

interface ISidebarTablesProps {
  connection: IConnection;
  selectedSchema: string;
  selectedTable: string | undefined;
  onOpenTable(table: string): void;
}

export default function SidebarTables(props: ISidebarTablesProps) {
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    async function run() {
      const { rows } = await props.connection.client.query(`
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

  return (
    <div className={styles.sidebarTables}>
      {tables.map(table => <a
        href=""
        className={classNames({ [styles.selected]: table === props.selectedTable})}
        key={table}
        onClick={(ev) => ev.preventDefault()}
        onDoubleClick={(ev) => onOpenTable(ev, table)}
      >
        {table}
      </a>)}
    </div>
  );
}
