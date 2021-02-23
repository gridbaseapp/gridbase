import React from 'react';
import classNames from 'classnames';
import { IConnection } from '../connection';
import styles from './Dock.scss';

interface IDocProps {
  openConnections: IConnection[];
  selectedConnection: IConnection;
  onShowLauncher(): void;
  onSelectConnection(connection: IConnection): void
  onDisconnect(conection: IConnection): void;
}

export default function Dock(props: IDocProps) {
  function onSelectConnection(ev: React.MouseEvent, connection: IConnection) {
    ev.preventDefault();
    props.onSelectConnection(connection);
  }

  function onDisconnect(ev: React.MouseEvent, connection: IConnection) {
    ev.stopPropagation();
    ev.preventDefault();
    props.onDisconnect(connection);
  }

  function onShowLauncher(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onShowLauncher();
  }

  return (
    <div className={styles.dock}>
      {props.openConnections.map((conn) => {
        return <a
          className={classNames({ [styles.selected]: conn === props.selectedConnection })}
          href=""
          key={conn.connectionDetails.uuid}
          onClick={(ev) => onSelectConnection(ev, conn)}
        >
          {conn.connectionDetails.database}
          <div className={styles.details}>
            <div>host: {conn.connectionDetails.host}</div>
            <div>port: {conn.connectionDetails.port}</div>
            <div>database: {conn.connectionDetails.database}</div>
            <div>user: {conn.connectionDetails.user}</div>
            <div><span onClick={(ev) => onDisconnect(ev, conn)}>Disconnect</span></div>
          </div>
        </a>;
      })}
      <a href="" onClick={onShowLauncher}>+</a>
    </div>
  );
}
