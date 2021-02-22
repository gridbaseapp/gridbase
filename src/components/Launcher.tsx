import React, { useEffect, useState } from 'react';
import LocalStore from '../utils/local-store'
import { Client } from 'pg';
import NewConnection from './NewConnection';
import styles from './Launcher.scss'
import { IConnection, IConnectionDetails } from '../connection';

interface ILauncherProps {
  localStore: LocalStore;
  openConnections: IConnection[];
  onConnect(conection: IConnection): void;
  onDisconnect(conection: IConnection): void;
  onClose(): void;
}

export default function Launcher(props: ILauncherProps) {
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [connections, setConnections] = useState<IConnectionDetails[]>([]);
  const [error, setError] = useState();

  useEffect(() => {
    const conns = props.localStore.getConnections();
    setConnections(conns);
    setShowNewConnection(conns.length === 0);
  }, [])

  function newConnection(ev: React.MouseEvent) {
    ev.preventDefault();
    setShowNewConnection(true);
  }

  function closeNewConnection() {
    setShowNewConnection(false);
  }

  function deleteConnection(ev: React.MouseEvent, connection: IConnectionDetails) {
    ev.preventDefault();

    const conns = connections.filter(e => e !== connection);
    props.localStore.setConnections(conns);
    setConnections(conns);
    if (conns.length === 0) setShowNewConnection(true);
  }

  async function connect(ev: React.MouseEvent, connection: IConnectionDetails) {
    ev.preventDefault();

    try {
      const client = new Client(connection);
      await client.connect();
      props.onConnect({ connectionDetails: connection, client: client });
    } catch(err) {
      setError(err.message);
    }
  }

  function disconnect(ev: React.MouseEvent, connection: IConnection) {
    ev.preventDefault();
    props.onDisconnect(connection);
  }

  function onClose(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onClose();
  }

  const list = connections.map((conn: IConnectionDetails) => {
    const open = props.openConnections.find(e => e.connectionDetails.uuid === conn.uuid);

    return (
      <div className={styles.connection} key={conn.uuid}>
        {conn.name} / {conn.host} / {conn.port} / {conn.database} / {conn.user}
        {!open && <a
          href=""
          onClick={(ev) => connect(ev, conn)}
        >Connect</a>}
        {!open && <a
          href=""
          onClick={(ev) => deleteConnection(ev, conn)}
        >Delete</a>}
        {open && <a
          href=""
          onClick={(ev) => disconnect(ev, open)}
        >Disconnect</a>}
      </div>
    );
  });

  return (
    <div className={styles.launcher}>
      {showNewConnection && <NewConnection
        localStore={props.localStore}
        onConnect={props.onConnect}
        onClose={connections.length > 0 ? closeNewConnection : undefined}
      />}

      {props.openConnections.length > 0 && <a href="" onClick={onClose}>Close</a>}

      <div className={styles.connection}>
        <a href="" onClick={newConnection}>new connection</a>
      </div>

      {list}

      <div className={styles.error}>{error}</div>
    </div>
  );
}
