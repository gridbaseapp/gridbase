import React from 'react';
import { IConnection } from '../connection';
import styles from './Dock.scss';
import DockItem from './DockItem';

interface IDocProps {
  openConnections: IConnection[];
  selectedConnection: IConnection;
  onShowLauncher(): void;
  onSelectConnection(connection: IConnection): void
  onDisconnect(conection: IConnection): void;
}

export default function Dock(props: IDocProps) {
  function onShowLauncher(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onShowLauncher();
  }

  return (
    <div className={styles.dock}>
      {props.openConnections.map(conn =>
        <DockItem
          key={conn.connectionDetails.uuid}
          connection={conn}
          selected={conn === props.selectedConnection}
          onSelectConnection={props.onSelectConnection}
          onDisconnect={props.onDisconnect}
        />
      )}
      <a className={styles.newConnection} href="" onClick={onShowLauncher}>+</a>
    </div>
  );
}
