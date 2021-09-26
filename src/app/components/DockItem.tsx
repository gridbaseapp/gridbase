import React from 'react';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import styles from './DockItem.scss';
import { Service } from '../types';

interface Props {
  service: Service;
  isActive: boolean;
  onActivateService(service: Service): void;
  onDisconnect(service: Service): void;
}

export function DockItem({
  service,
  isActive,
  onActivateService,
  onDisconnect,
}: Props) {
  function handleActivateService(ev: React.MouseEvent) {
    ev.preventDefault();
    onActivateService(service);
  }

  function handleDisconnect(ev: React.MouseEvent) {
    ev.preventDefault();
    onDisconnect(service);
  }

  const { host, port, database, user } = service.connection;

  return (
    <div>
      <Tippy
        placement="right-start"
        delay={[200, 100]}
        interactive={true}
        interactiveBorder={10}
        render={attrs => (
          <div className={styles.popover} {...attrs}>
            <div>host: {host}</div>
            <div>port: {port}</div>
            <div>database: {database}</div>
            <div>user: {user}</div>
            <div><a href="" onClick={handleDisconnect}>Disconnect</a></div>
          </div>
        )}
      >
        <a
          className={classNames(styles.item, { [styles.selected]: isActive })}
          href=""
          onClick={handleActivateService}
        >
          {database}
        </a>
      </Tippy>
    </div>
  );
}
