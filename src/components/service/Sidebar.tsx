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

interface ISidebarProps {
  hasFocus: boolean;
  onFocus: () => void;
}

export default function Sidebar(props: ISidebarProps) {
  const adapter = useSelector((state: IState) => state.adapter);
  const [selectedTab, setSelectedTab] = useState<SelectedTab>(SelectedTab.Tables);

  return (
    <div className={styles.sidebar}  onClick={props.onFocus}>
      <h1>{adapter.connection.database}</h1>
      <SchemaSelector />
      <SidebarTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      <div className={styles.content}>
        <SidebarEntities
          entityTypes={[EntityType.Table]}
          visible={selectedTab === SelectedTab.Tables}
          hasFocus={props.hasFocus}
        />
        <SidebarEntities
          entityTypes={[EntityType.View, EntityType.MaterializeView]}
          visible={selectedTab === SelectedTab.Views}
          hasFocus={props.hasFocus}
        />
      </div>
    </div>
  );
}
