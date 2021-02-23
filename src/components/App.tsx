import React, { useState, useEffect } from 'react';
import { Client } from 'pg';
import { getPasswordFromKeyStore } from '../utils/key-store';
import LocalStore from '../utils/local-store';
import { IConnection, IConnectionDetails } from '../connection';
import Splash from './Splash';
import Launcher from './Launcher';
import Dock from './Dock';
// import Content from './Content';
import styles from './App.scss';

const SPLASH_SCREEN_TIMOUT = 1;

function findExistingConnectionDetails(conns: IConnectionDetails[], conn: IConnectionDetails) {
  return conns.find(e => {
    return e.type === conn.type &&
           e.host === conn.host &&
           e.port === conn.port &&
           e.database === conn.database &&
           e.user === conn.user &&
           e.password === conn.password;
  });
}

export default function App() {
  const [localStore, setLocalStore] = useState<LocalStore>();
  const [connectionsDetails, setConnectionsDetails] = useState<IConnectionDetails[]>([]);
  const [openConnections, setOpenConnections] = useState<IConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<IConnection>();
  const [showLauncher, setShowLauncher] = useState(true);

  useEffect(() => {
    async function run() {
      const [pass] = await Promise.all([
        getPasswordFromKeyStore(),
        // show splash screen for at least {SPLASH_SCREEN_TIMOUT} to prevent flickering
        new Promise<void>(resolve => setTimeout(() => resolve(), SPLASH_SCREEN_TIMOUT)),
      ]);

      const store = new LocalStore(pass);

      setConnectionsDetails(store.getConnections());
      setLocalStore(store);
    }

    run();
  }, []);

  async function onCreateConnectionDetails(details: IConnectionDetails) {
    const found = findExistingConnectionDetails(connectionsDetails, details);

    if (found) {
      await onConnect(found);
    } else {
      await onConnect(details);

      const updatedConnectionsDetails = [...connectionsDetails, details];
      setConnectionsDetails(updatedConnectionsDetails);
      localStore?.setConnections(updatedConnectionsDetails);
    }
  }

  function onDeleteConnectionDetails(details: IConnectionDetails) {
    const filtered = connectionsDetails.filter(e => e !== details);
    setConnectionsDetails(filtered);
    localStore?.setConnections(filtered);
  }

  async function onConnect(details: IConnectionDetails) {
    const client = new Client(details);
    await client.connect();

    const connection = { connectionDetails: details, client: client }

    setOpenConnections([...openConnections, connection]);
    setSelectedConnection(connection);
    setShowLauncher(false);
  }

  async function onDisconnect(connection: IConnection) {
    await connection.client.end();

    const connections = openConnections.filter(e => e !== connection);
    setOpenConnections(connections);

    if (connections.length > 0) {
      setSelectedConnection(connections[0]);
    } else {
      setSelectedConnection(undefined);
      setShowLauncher(true);
    }
  }

  let content = <Splash />;

  if (localStore) {
    content = (
      <>
        {showLauncher && <Launcher
          connectionsDetails={connectionsDetails}
          openConnectionsDetails={openConnections.map(e => e.connectionDetails)}
          onCreateConnectionDetails={onCreateConnectionDetails}
          onDeleteConnectionDetails={onDeleteConnectionDetails}
          onConnect={onConnect}
          onClose={() => setShowLauncher(false)}
        />}
        {openConnections.length > 0 && selectedConnection && <div className={styles.appContent}>
          <Dock
            openConnections={openConnections}
            selectedConnection={selectedConnection}
            onShowLauncher={() => setShowLauncher(true)}
            onSelectConnection={setSelectedConnection}
            onDisconnect={onDisconnect}
          />
        </div>}
      </>
    );

  //   if (connections.length > 0) {
  //     content += (
  // //       {connections.map((e, i) => {
  // //         return <Content active={e === selectedConnection} key={i} connection={e} />
  // //       })} */}
  //     );
  //   }
  }

  return (
    <div className={styles.app}>
      {content}
    </div>
  );
}
