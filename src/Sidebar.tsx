import * as React from 'react';
import { useEffect, useState } from 'react';
import { Client } from 'pg';
import styles from 'Sidebar.scss';

const client = new Client({
  user: 'db1',
  password: 'db1',
  database: 'db1',
  host: 'localhost',
  port: 5432,
});

client.connect();

export default function Sidebar({ onClickRow }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function queryDB() {
      const { rows } = await client.query(`
        SELECT c.relname AS name
        FROM pg_catalog.pg_class c
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind IN ('r', 'p', '') AND n.nspname = 'public'
        ORDER BY c.relname;
      `);

      setRows(rows);
    };

    queryDB();
  }, []);

  return (
    <div className={styles.sidebar}>
      {rows.map((row) => <a href="" key={row.name} onClick={(e) => onClickRow(e, row)}>{row.name}</a>)}
    </div>
  );
}
