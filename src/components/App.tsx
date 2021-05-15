import React, { useState, useEffect } from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { getPasswordFromKeyStore } from '../utils/key-store';
import LocalStore from '../utils/local-store';
import { IConnection } from '../connection';
import { configureStore, IState } from '../state';
import Splash from './Splash';
import Launcher from './Launcher';
import Dock from './Dock';
import ServiceComponent from './service/Service';
import TitleBar from './TitleBar';
import styles from './App.scss';
import { PostgreSQL } from '../adapters/PostgreSQL';

const SPLASH_SCREEN_TIMOUT = 1;

function findExistingConnection(connections: IConnection[], connection: IConnection) {
  return connections.find(e => {
    return e.type === connection.type &&
           e.host === connection.host &&
           e.port === connection.port &&
           e.database === connection.database &&
           e.user === connection.user &&
           e.password === connection.password;
  });
}

export class Service {
  store: Store<IState>;

  constructor(store: Store<IState>) {
    this.store = store;
  }

  get adapter() {
    return this.store.getState().adapter;
  }

  get connection() {
    return this.adapter.connection;
  }
}

export default function App() {
  const [localStore, setLocalStore] = useState<LocalStore>();
  const [connections, setConnections] = useState<IConnection[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service>();
  const [showLauncher, setShowLauncher] = useState(true);

  useEffect(() => {
    async function run() {
      const [pass] = await Promise.all([
        getPasswordFromKeyStore(),
        // show splash screen for at least {SPLASH_SCREEN_TIMOUT} to prevent flickering
        new Promise<void>(resolve => setTimeout(() => resolve(), SPLASH_SCREEN_TIMOUT)),
      ]);

      const store = new LocalStore(pass);

      setConnections(store.getConnections());
      setLocalStore(store);
    }

    run();
  }, []);

  async function onCreateConnection(connection: IConnection) {
    const existingConnection = findExistingConnection(connections, connection);

    if (existingConnection) {
      const service = services.find(e => e.connection === existingConnection);

      if (service) {
        setSelectedService(service);
        setShowLauncher(false);
      } else {
        await onConnect(existingConnection);
      }
    } else {
      await onConnect(connection);

      const updatedConnections = [...connections, connection];
      setConnections(updatedConnections);
      localStore?.setConnections(updatedConnections);
    }
  }

  function onDeleteConnection(connection: IConnection) {
    const filtered = connections.filter(e => e !== connection);
    setConnections(filtered);
    localStore?.setConnections(filtered);
  }

  async function onConnect(connection: IConnection) {
    const adapter = new PostgreSQL(connection);
    await adapter.connect();

    if (localStore) {
      const service = new Service(configureStore(localStore, adapter));
      setServices([...services, service]);
      setSelectedService(service);
      setShowLauncher(false);
    }
  }

  async function onCloseService(service: Service) {
    await service.adapter.disconnect();

    const activeServices = services.filter(e => e !== service);
    setServices(activeServices);

    if (activeServices.length > 0) {
      setSelectedService(services[0]);
    } else {
      setSelectedService(undefined);
      setShowLauncher(true);
    }
  }

  let content = <Splash />;

  if (localStore) {
    let servicesRender = null;

    if (services.length > 0) {
      servicesRender = services.map(e => {
        return (
          <Provider store={e.store} key={e.connection.uuid}>
            <ServiceComponent visible={e === selectedService} />
          </Provider>
        );
      });
    }

    content = (
      <>
        {showLauncher && <Launcher
          connections={connections}
          openConnections={services.map(e => e.connection)}
          onCreateConnection={onCreateConnection}
          onDeleteConnection={onDeleteConnection}
          onConnect={onConnect}
          onClose={() => setShowLauncher(false)}
        />}
        {services.length > 0 && selectedService && <>
          <TitleBar />
          <Dock
            services={services}
            selectedService={selectedService}
            onShowLauncher={() => setShowLauncher(true)}
            onSelectService={setSelectedService}
            onCloseService={onCloseService}
          />
          {servicesRender}
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
