import React, { useState, useEffect } from 'react';
import { Client } from 'pg';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { getPasswordFromKeyStore } from '../utils/key-store';
import LocalStore from '../utils/local-store';
import { IConnection, IConnectionDetails } from '../connection';
import { configureStore, IState } from '../state';
import Splash from './Splash';
import Launcher from './Launcher';
import Dock from './Dock';
import Service from './service/Service';
import TitleBar from './TitleBar';
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
  const [stores, setStores] = useState<Store<IState>[]>([]);
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
      const alreadyOpened = openConnections.find(e => e.connectionDetails === found);

      if (alreadyOpened) {
        setSelectedConnection(alreadyOpened);
        setShowLauncher(false);
      } else {
        await onConnect(found);
      }
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
    if (localStore) setStores([...stores, configureStore(localStore, connection)]);
    setShowLauncher(false);
  }

  async function onDisconnect(connection: IConnection) {
    await connection.client.end();

    const connections = openConnections.filter(e => e !== connection);
    setOpenConnections(connections);

    const activeStores = stores.filter(e => {
      const state = e.getState();
      return state.connection !== connection;
    });
    setStores(activeStores);

    if (connections.length > 0) {
      setSelectedConnection(connections[0]);
    } else {
      setSelectedConnection(undefined);
      setShowLauncher(true);
    }
  }

  let content = <Splash />;

  if (localStore) {
    let connectionsRender = null;

    if (openConnections.length > 0) {
      connectionsRender = stores.map(e => {
        const state = e.getState();
        const connection = state.connection;

        return (
          <Provider store={e} key={connection.connectionDetails.uuid}>
            <Service visible={connection === selectedConnection} />
          </Provider>
        );
      })
    }

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
        {openConnections.length > 0 && selectedConnection && <>
          <TitleBar />
          <Dock
            openConnections={openConnections}
            selectedConnection={selectedConnection}
            onShowLauncher={() => setShowLauncher(true)}
            onSelectConnection={setSelectedConnection}
            onDisconnect={onDisconnect}
          />
          {connectionsRender}
        </>}
      </>
    );
  }

  return (
    <div className={styles.app}>
      {content}
    </div>
  );
}
