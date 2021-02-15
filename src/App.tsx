import React, { useState } from 'react';
import NewConnection from './NewConnection';
import Dock from './Dock';
import Content from './Content';
import styles from './App.scss';

export default function App() {
  const [showNewConnection, setShowNewConnection] = useState(true);
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);

  function addConnection(connection) {
    const conns = [...connections];
    conns.push(connection);
    setConnections(conns);
    setSelectedConnection(connection);
    setShowNewConnection(false);
  }

  return (
    <div className={styles.app}>
      {showNewConnection && <NewConnection
        onConnect={addConnection}
        onClose={() => setShowNewConnection(false)}
      />}
      <div className={styles.appContent}>
        <Dock
          connections={connections}
          onSelectConnection={(conn) => setSelectedConnection(conn)}
          onNewConnection={() => setShowNewConnection(true)}
        />
        {connections.map((e, i) => {
          return <Content active={e === selectedConnection} key={i} connection={e} />
        })}
      </div>
    </div>
  );
}
