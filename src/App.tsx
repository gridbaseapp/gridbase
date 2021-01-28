import React, { useEffect, useState } from 'react';
import { Client } from 'pg';
import styles from 'index.css';

const client = new Client({
  user: 'db1',
  password: 'db1',
  database: 'db1',
  host: 'localhost',
  port: 5432,
});

client.connect();

export default function App() {
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function queryDB() {
      const [metadata, res] = await Promise.all([
        client.query(`
          SELECT a.attname, a.attnum, pg_catalog.format_type(a.atttypid, a.atttypmod), i.indisprimary
          FROM pg_catalog.pg_attribute a
          LEFT JOIN pg_index i ON i.indrelid = a.attrelid AND a.attnum = ANY(i.indkey)
          WHERE a.attrelid = '16943' AND a.attnum > 0 AND NOT a.attisdropped
          ORDER BY a.attnum`
        ),
        client.query('SELECT * FROM db1_books_complex_primary_key'),
      ]);

      setFields(metadata.rows);
      setRows(res.rows);
    };

    queryDB();
  }, []);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {fields.map(row => <th key={row.attname}>{row.attname}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => <tr key={fields.filter(e => e.indisprimary).map(e => row[e.attname]).join('-')}>{fields.map((field, i) => <td key={fields.filter(e => e.indisprimary).map(e => row[e.attname]).join('-') + '-' + i}>{row[field.attname]}</td>)}</tr>)}
      </tbody>
    </table>
  );
}
