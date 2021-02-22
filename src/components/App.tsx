import React, { useState, useEffect } from 'react';
import { getPasswordFromKeyStore } from '../utils/key-store';
import LocalStore from '../utils/local-store';
import { IConnection } from '../connection';
import Splash from './Splash';
import Launcher from './Launcher';
import Dock from './Dock';
// import Content from './Content';
import styles from './App.scss';
import { Connection } from 'pg';

const SPLASH_SCREEN_TIMOUT = 1;

export default function App() {
  const [localStore, setLocalStore] = useState<LocalStore>();
  const [showLauncher, setShowLauncher] = useState(true);
  const [connections, setConnections] = useState<IConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<IConnection>();

  useEffect(() => {
    async function run() {
      const [pass] = await Promise.all([
        getPasswordFromKeyStore(),
        // show splash screen for at least {SPLASH_SCREEN_TIMOUT} to prevent flickering
        new Promise<void>(resolve => setTimeout(() => resolve(), SPLASH_SCREEN_TIMOUT)),
      ]);
      setLocalStore(new LocalStore(pass));
    }

    run();
  }, []);

  function addConnection(connection: IConnection) {
    const conns = [...connections];
    conns.push(connection);
    setConnections(conns);
    setSelectedConnection(connection);
    setShowLauncher(false);
  }

  function disconnect(connection: IConnection) {
    const conns = connections.filter(e => e !== connection);
    setConnections(conns);
    connection.client.end();

    if (conns.length > 0) {
      setSelectedConnection(conns[0]);
    } else {
      setSelectedConnection(undefined);
      setShowLauncher(true);
    }
  }

  let content = <Splash />;

  if (localStore) {
    content = (
      <React.Fragment>
        {showLauncher && <Launcher
          localStore={localStore}
          openConnections={connections}
          onConnect={addConnection}
          onDisconnect={disconnect}
          onClose={() => setShowLauncher(false)}
        />}
        {connections.length > 0 && selectedConnection && <div className={styles.appContent}>
          <Dock
            connections={connections}
            selectedConnection={selectedConnection}
            showLauncher={() => setShowLauncher(true)}
            selectConnection={setSelectedConnection}
            onDisconnect={disconnect}
          />
        </div>}
      </React.Fragment>
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
