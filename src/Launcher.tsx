import React, { useEffect, useState } from 'react';
import { Client } from 'pg';
import { loadConnections } from './store';
import styles from './Launcher.scss'

export default function Launcher({ onNewConnection, onConnect }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    async function load() {
      setConnections(await loadConnections());
    }

    load();
  }, [])

  function addConnection(e) {
    e.preventDefault();
    onNewConnection();
  }

  async function connect(e, { host, port, database, user, password }) {
    e.preventDefault();

    const client = new Client({ host, port, database, user, password });
    await client.connect();
    onConnect(client);
  }

  const list = connections.map((conn, i) => {
    return (
      <div key={i}>
        {conn.host} / {conn.port} / {conn.database} / {conn.user}
        <a href="" onClick={(e) => connect(e, conn)}>Connect</a>
      </div>
    );
  });

  return (
    <div className={styles.launcher}>
      <div>
        <a href="" onClick={addConnection}>new connection</a>
      </div>
      {list}
    </div>
  );
}
