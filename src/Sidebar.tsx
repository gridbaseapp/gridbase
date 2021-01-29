import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from 'Sidebar.scss';

export default function Sidebar({ connection, onClickRow }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function queryDB() {
      const { rows } = await connection.query(`
        SELECT c.relname AS name
        FROM pg_catalog.pg_class c
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind IN ('r', 'p', '') AND n.nspname = 'public'
        ORDER BY c.relname;
      `);

      setRows(rows);
    };

    queryDB();
  }, [connection]);

  return (
    <div className={styles.sidebar}>
      {rows.map((row) => <a href="" key={row.name} onClick={(e) => onClickRow(e, row)}>{row.name}</a>)}
    </div>
  );
}
