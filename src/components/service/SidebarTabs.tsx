import React from 'react';
import classNames from 'classnames';
import styles from './SidebarTabs.scss';

interface ISidebarTabsProps {
  selectedTab: string;
  onSelectTab(tab: string): void;
}

export default function SidebarTabs(props: ISidebarTabsProps) {
  function onSelectTab(ev: React.MouseEvent, tab: string) {
    ev.preventDefault();
    props.onSelectTab(tab);
  }

  return (
    <div className={styles.sidebarTabs}>
      <a
        className={classNames({ [styles.selected]: props.selectedTab === 'tables' })}
        href=""
        onClick={(ev) => onSelectTab(ev, 'tables')}
      >Tables</a>
      <a
        className={classNames({ [styles.selected]: props.selectedTab === 'views' })}
        href=""
        onClick={(ev) => onSelectTab(ev, 'views')}>
        Views</a>
    </div>
  );
}
