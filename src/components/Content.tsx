import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import Table from './Table';
import styles from './Content.scss';

interface IContentProps {
  className: string;
  localStore: LocalStore;
  connection: IConnection;
}

export default function Content(props: IContentProps) {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState('public');
  const [openTables, setOpenTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>();

  useEffect(() => {
    async function run() {
      const savedSchema = props
        .localStore
        .getSchema(props.connection.connectionDetails.uuid);

      const { rows } = await props.connection.client.query(`
        SELECT n.nspname AS name
        FROM pg_catalog.pg_namespace n
        WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
        ORDER BY name;
      `);

      const schemas = rows.map(e => e.name);
      setSchemas(schemas);

      if (savedSchema && schemas.includes(savedSchema)) {
        setSelectedSchema(savedSchema);
      } else if (schemas.includes('public')) {
        setSelectedSchema('public');
      } else {
        setSelectedSchema(schemas[0]);
      }
    };

    run();
  }, []);

  function onSelectSchema(schema: string) {
    props.localStore.setSchema(props.connection.connectionDetails.uuid, schema);
    setSelectedSchema(schema);
  }

  function onOpenTable(table: string) {
    setOpenTables([...openTables, table]);
    setSelectedTable(table);
  }

  function onCloseTable(table: string) {
    const tables = openTables.filter(e => e !== table);
    setOpenTables(tables);

    if (selectedTable === table) {
      setSelectedTable(tables.length > 0 ? tables[tables.length - 1] : undefined);
    }
  }

  return (
    <div className={classNames(styles.content, props.className)}>
      <Sidebar
        connection={props.connection}
        schemas={schemas}
        selectedSchema={selectedSchema}
        selectedTable={selectedTable}
        onSelectSchema={onSelectSchema}
        onOpenTable={onOpenTable}
      />
      <div className={styles.tabsContent}>
        <Tabs
          tables={openTables}
          selectedTable={selectedTable}
          onSelectTable={(table) => setSelectedTable(table)}
          onCloseTable={onCloseTable}
        />
        {openTables.map(table => (
          <Table
            key={table}
            className={classNames({ [styles.hidden]: table !== selectedTable })}
            connection={props.connection}
            schema={selectedSchema}
            table={table}
          />
        ))}
      </div>
    </div>
  );
}
