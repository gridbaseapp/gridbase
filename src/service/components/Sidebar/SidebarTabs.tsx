import React from 'react';
import classNames from 'classnames';
import styles from './SidebarTabs.scss';
import { Tab } from './types';

interface Props {
  activeTab: Tab;
  onActivateTab(tab: Tab): void;
}

export function SidebarTabs({ activeTab, onActivateTab }: Props) {
  function handleActivateTab(ev: React.MouseEvent, tab: Tab) {
    ev.preventDefault();
    onActivateTab(tab);
  }

  return (
    <div className={styles.sidebarTabs}>
      <a
        className={classNames({ [styles.active]: activeTab === 'tables' })}
        onClick={(ev) => handleActivateTab(ev, 'tables')}
      >
        Tables
      </a>
      <a
        className={classNames({ [styles.active]: activeTab === 'views' })}
        onClick={(ev) => handleActivateTab(ev, 'views')}
      >
        Views
      </a>
      <a
        className={classNames({ [styles.active]: activeTab === 'queries' })}
        onClick={(ev) => handleActivateTab(ev, 'queries')}
      >
        Queries
      </a>
    </div>
  );
}
