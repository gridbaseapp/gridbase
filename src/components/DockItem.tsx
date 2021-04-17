import React from 'react';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import { IConnection } from '../connection';
import styles from './DockItem.scss';

interface IdocItemProps {
  connection: IConnection;
  selected: boolean;
  onSelectConnection(connection: IConnection): void;
  onDisconnect(connection: IConnection): void;
}

export default function DockItem(props: IdocItemProps) {
  function onSelectConnection(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onSelectConnection(props.connection);
  }

  function onDisconnect(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onDisconnect(props.connection);
  }

  return (
    <div>
      <Tippy
        placement="right-start"
        delay={200}
        interactive={true}
        interactiveBorder={10}
        render={attrs => (
          <div className={styles.popover} {...attrs}>
            <div>host: {props.connection.connectionDetails.host}</div>
            <div>port: {props.connection.connectionDetails.port}</div>
            <div>database: {props.connection.connectionDetails.database}</div>
            <div>user: {props.connection.connectionDetails.user}</div>
            <div><a href="" onClick={onDisconnect}>Disconnect</a></div>
          </div>
        )}
      >
        <a
          className={classNames(styles.item, { [styles.selected]: props.selected })}
          href=""
          onClick={onSelectConnection}
        >
          {props.connection.connectionDetails.database}
        </a>
      </Tippy>
    </div>
  );
}
