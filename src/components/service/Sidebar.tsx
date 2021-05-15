import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SchemaSelector from './SchemaSelector';
import SidebarEntities from './SidebarEntities';
import SidebarTabs from './SidebarTabs';
import styles from './Sidebar.scss';
import { EntityType, IState } from '../../state';

export enum SelectedTab {
  Tables,
  Views,
}

export default function Sidebar() {
  const connection = useSelector((state: IState) => state.connection);
  const [selectedTab, setSelectedTab] = useState<SelectedTab>(SelectedTab.Tables);

  return (
    <div className={styles.sidebar}>
      <h1>{connection.connectionDetails.database}</h1>
      <SchemaSelector />
      <SidebarTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      <div className={styles.content}>
        {selectedTab === SelectedTab.Tables && <SidebarEntities
          entityTypes={[EntityType.Table]}
        />}
        {selectedTab === SelectedTab.Views && <SidebarEntities
          entityTypes={[EntityType.View, EntityType.MaterializeView]}
        />}
      </div>
    </div>
  );
}
