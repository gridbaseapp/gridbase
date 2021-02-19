import React, { useEffect, useState } from 'react';
import LocalStore from '../utils/local-store'
// import { Client } from 'pg';
import NewConnection from './NewConnection';
import styles from './Launcher.scss'
import { IConnectionDetails } from '../connection-details';

interface ILauncherProps {
  localStore: LocalStore;
}

export default function Launcher(props: ILauncherProps) {
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [connections, setConnections] = useState<IConnectionDetails[]>([]);

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

  // async function connect(e, { host, port, database, user, password }) {
  //   e.preventDefault();

  //   const client = new Client({ host, port, database, user, password });
  //   await client.connect();
  //   onConnect(client);
  // }

  const list = connections.map((conn: IConnectionDetails) => {
    const key = `${conn.type}-${conn.host}-${conn.port}-${conn.database}-${conn.user}`;

    return (
      <div className={styles.connection} key={key}>
        {conn.name} / {conn.host} / {conn.port} / {conn.database} / {conn.user}
        <a href="">Connect</a>
        <a href="" onClick={(ev) => deleteConnection(ev, conn)}>Delete</a>
      </div>
    );
  });

  return (
    <div className={styles.launcher}>
      {showNewConnection && <NewConnection
        localStore={props.localStore}
        onClose={connections.length > 0 ? closeNewConnection : undefined}
      />}

      <div className={styles.connection}>
        <a href="" onClick={newConnection}>new connection</a>
      </div>

      {list}
    </div>
  );
}
