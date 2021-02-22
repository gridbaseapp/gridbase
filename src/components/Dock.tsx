import React from 'react';
import classNames from 'classnames';
import { IConnection } from '../connection';
import styles from './Dock.scss';

interface IDocProps {
  connections: IConnection[];
  selectedConnection: IConnection;
  showLauncher(): void;
  selectConnection(connection: IConnection): void
  onDisconnect(conection: IConnection): void;
}

export default function Dock(props: IDocProps) {
  function selectConnection(ev: React.MouseEvent, connection: IConnection) {
    ev.preventDefault();
    props.selectConnection(connection);
  }

  function showLauncher(ev: React.MouseEvent) {
    ev.preventDefault();
    props.showLauncher();
  }

  function disconnect(ev: React.MouseEvent, connection: IConnection) {
    ev.stopPropagation();
    ev.preventDefault();
    props.onDisconnect(connection);
  }

  return (
    <div className={styles.dock}>
      {props.connections.map((conn) => {
        return <a
          className={classNames({ [styles.selected]: conn === props.selectedConnection })}
          href=""
          key={conn.connectionDetails.uuid}
          onClick={(ev) => selectConnection(ev, conn)}
        >
          {conn.connectionDetails.database}
          <div className={styles.details}>
            <div>host: {conn.connectionDetails.host}</div>
            <div>port: {conn.connectionDetails.port}</div>
            <div>database: {conn.connectionDetails.database}</div>
            <div>user: {conn.connectionDetails.user}</div>
            <div><span onClick={(ev) => disconnect(ev, conn)}>Disconnect</span></div>
          </div>
        </a>;
      })}
      <a href="" onClick={showLauncher}>+</a>
    </div>
  );
}
