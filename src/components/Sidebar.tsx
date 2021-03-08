import React from 'react';
import { IConnection } from '../connection';
import SchemaSelector from './SchemaSelector';
import SidebarTables from './SidebarTables';
import styles from './Sidebar.scss';

interface ISidebarProps {
  connection: IConnection;
  schemas: string[];
  selectedSchema: string;
  selectedTable: string | undefined;
  onSelectSchema(schema: string): void;
  onOpenTable(table: string): void;
}

export default function Sidebar(props: ISidebarProps) {
  return (
    <div className={styles.sidebar}>
      <h1>{props.connection.connectionDetails.database}</h1>
      <div className={styles.content}>
        <SchemaSelector
          schemas={props.schemas}
          selectedSchema={props.selectedSchema}
          onSelectSchema={props.onSelectSchema}
        />
        <SidebarTables
          connection={props.connection}
          selectedSchema={props.selectedSchema}
          selectedTable={props.selectedTable}
          onOpenTable={props.onOpenTable}
        />
      </div>
    </div>
  );
}
