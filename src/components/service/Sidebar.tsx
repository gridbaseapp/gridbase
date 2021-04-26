import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SchemaSelector from './SchemaSelector';
import SidebarTables from './SidebarTables';
import SidebarViews from './SidebarViews';
import SidebarTabs from './SidebarTabs';
import styles from './Sidebar.scss';
import { IState } from '../store';

interface ISidebarProps {
  schemas: string[];
  selectedSchema: string;
  selectedEntity: string | undefined;
  onSelectSchema(schema: string): void;
  onOpenEntity(entity: string): void;
}

export default function Sidebar(props: ISidebarProps) {
  const connection = useSelector((state: IState) => state.connection);
  const [selectedTab, setSelectedTab] = useState('tables');

  return (
    <div className={styles.sidebar}>
      <h1>{connection.connectionDetails.database}</h1>
      <div className={styles.content}>
        <SchemaSelector
          schemas={props.schemas}
          selectedSchema={props.selectedSchema}
          onSelectSchema={props.onSelectSchema}
        />
        <SidebarTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        {selectedTab === 'tables' && <SidebarTables
          selectedSchema={props.selectedSchema}
          selectedTable={props.selectedEntity}
          onOpenTable={props.onOpenEntity}
        />}
        {selectedTab === 'views' && <SidebarViews
          selectedSchema={props.selectedSchema}
          selectedView={props.selectedEntity}
          onOpenView={props.onOpenEntity}
        />}
      </div>
    </div>
  );
}
