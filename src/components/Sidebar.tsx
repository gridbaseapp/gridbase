import React from 'react';
import { IConnection } from '../connection';
import SchemaSelector from './SchemaSelector';
import SidebarTables from './SidebarTables';
import styles from './Sidebar.scss';

interface ISidebarProps {
  connection: IConnection;
  schemas: string[];
  selectedSchema: string;
  onSelectSchema(schema: string): void;
}

export default function Sidebar(props: ISidebarProps) {
  return (
    <div className={styles.sidebar}>
      <h1>{props.connection.connectionDetails.database}</h1>
      <SchemaSelector
        schemas={props.schemas}
        selectedSchema={props.selectedSchema}
        onSelectSchema={props.onSelectSchema}
      />
      <SidebarTables
        connection={props.connection}
        selectedSchema={props.selectedSchema}
      />
    </div>
  );
}
