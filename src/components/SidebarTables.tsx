import React, { useEffect, useState } from 'react';
import { IConnection } from '../connection';
import styles from './SidebarTables.scss';

interface ISidebarTables {
  connection: IConnection;
  selectedSchema: string;
}

export default function SidebarTables(props: ISidebarTables) {
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

  return (
    <div className={styles.sidebarTables}>
      {tables.map(e => <a href="" key={e}>{e}</a>)}
    </div>
  );
}
