import React from 'react';
import classNames from 'classnames';
import { SelectedTab } from './Sidebar'
import styles from './SidebarTabs.scss';

interface ISidebarTabsProps {
  selectedTab: SelectedTab;
  onSelectTab(tab: SelectedTab): void;
}

export default function SidebarTabs(props: ISidebarTabsProps) {
  function onSelectTab(ev: React.MouseEvent, tab: SelectedTab) {
    ev.preventDefault();
    props.onSelectTab(tab);
  }

  return (
    <div className={styles.sidebarTabs}>
      <a
        className={classNames({ [styles.selected]: props.selectedTab === SelectedTab.Tables })}
        href=""
        onClick={(ev) => onSelectTab(ev, SelectedTab.Tables)}
      >Tables</a>
      <a
        className={classNames({ [styles.selected]: props.selectedTab === SelectedTab.Views })}
        href=""
        onClick={(ev) => onSelectTab(ev, SelectedTab.Views)}>
        Views</a>
    </div>
  );
}
