import React, { useState, useEffect } from 'react';
import { getPasswordFromKeyStore } from '../utils/key-store';
import LocalStore from '../utils/local-store';
import Splash from './Splash';
import Launcher from './Launcher';
// import Dock from './Dock';
// import Content from './Content';
import styles from './App.scss';

const SPLASH_SCREEN_TIMOUT = 1;

export default function App() {
  const [localStore, setLocalStore] = useState<LocalStore>();
  // const [showLauncher, setShowLauncher] = useState(true);
  // const [connections, setConnections] = useState([]);
  // const [selectedConnection, setSelectedConnection] = useState(null);

  // function addConnection(connection) {
  //   const conns = [...connections];
  //   conns.push(connection);
  //   setConnections(conns);
  //   setSelectedConnection(connection);
  //   setShowNewConnection(false);
  // }

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

  let content = <Splash />;

  if (localStore) {
    content = <Launcher localStore={localStore} />
  }
  // if (connections.length > 0) {
  //   content = (
  //     <div className={styles.appContent}>
  //       {/* <Dock
  //         connections={connections}
  //         onSelectConnection={(conn) => setSelectedConnection(conn)}
  //         onNewConnection={() => setShowNewConnection(true)}
  //       />
  //       {connections.map((e, i) => {
  //         return <Content active={e === selectedConnection} key={i} connection={e} />
  //       })} */}
  //     </div>
  //   );
  // }

  return (
    <div className={styles.app}>
      {content}
    </div>
  );
}
