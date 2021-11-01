import React, { useState } from 'react';
import classNames from 'classnames';
import { useServiceContext } from '../../hooks';
import { SchemaSelector } from './SchemaSelector';
import { SidebarTabs } from './SidebarTabs';
import { SidebarEntities } from './SidebarEntities';
import { EntityType } from '../../types';
import styles from './Sidebar.scss';
import { useFocus } from '../../../app/hooks';
import { Tab } from './types';

interface Props {
  hasFocus: boolean;
  onFocus(): void;
}

export function Sidebar({ hasFocus, onFocus }: Props) {
  const { connection } = useServiceContext();

  const [activeTab, setActiveTab] = useState<Tab>('tables');

  useFocus(`Sidebar-${connection.uuid}`, hasFocus);

  return (
    <div
      className={classNames(styles.sidebar, { focus: hasFocus })}
      onClick={onFocus}
    >
      <h1>{connection.database}</h1>
      <SchemaSelector />
      <SidebarTabs activeTab={activeTab} onActivateTab={setActiveTab} />

      <div className={styles.content}>
        {activeTab === 'tables' && (
          <SidebarEntities
            entityTypes={[EntityType.Table]}
          />
        )}
        {activeTab === 'views' && (
          <SidebarEntities
            entityTypes={[EntityType.View, EntityType.MaterializedView]}
          />
        )}
        {activeTab === 'queries' && (
          <SidebarEntities
            entityTypes={[EntityType.Query]}
          />
      )}
      </div>
    </div>
  );
}
