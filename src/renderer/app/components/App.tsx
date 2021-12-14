import React, { useEffect, useState } from 'react';
import { PostgreSQLAdapter } from '../../service/adapter';
import { Launcher } from './Launcher';
import { Splash } from "./Splash";
import { Dock } from './Dock';
import { PostgreSQLServiceContext, PostgreSQLService } from '../../service';
import { TitleBar } from './TitleBar';
import styles from './App.scss';
import { useDidUpdateEffect, useFocus, useHotkey, useSecureStore } from '../hooks';
import { SecureStore } from '../SecureStore';
import { AvailableUpdate, Connection, Service } from '../types';
import { AppContext } from './AppContext';
import { getPasswordFromVault } from '../vault';
import { findExistingConnection } from '../utils';
import { ipcRenderer } from 'electron';
import { KeyBindings } from '../../Hotkeys';

const CHECK_FOR_UPDATES_INTERVAL = 5 * 60 * 60 * 1000; // 5 hours

interface Props {
  initialConnections: Connection[];
}

function AppContent({ initialConnections }: Props) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [services, setServices] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isLauncherVisible, setLauncherVisible] = useState(true);
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdate | null>(null);

  const [_, saveConnections] = useSecureStore<Connection[]>('connections');

  const scope = 'App';

  useFocus(scope);

  useHotkey(scope, KeyBindings['app.show_launcher'], () => {
    setLauncherVisible(true);
  });

  useHotkey(scope, KeyBindings['app.disconnect'], () => {
    if (activeService) handleDisconnect(activeService);
  }, [activeService]);

  // prevent default scroll behavior
  useHotkey(scope, KeyBindings['app.prevent_default_scroll_behavior'], (ev) => {
    ev.preventDefault();
  }, [], { global: false });

  useHotkey(scope, KeyBindings['app.switch_connection_1'], () => {
    const service = services[0];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_2'], () => {
    const service = services[1];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_3'], () => {
    const service = services[2];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_4'], () => {
    const service = services[3];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_5'], () => {
    const service = services[4];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_6'], () => {
    const service = services[5];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_7'], () => {
    const service = services[6];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_8'], () => {
    const service = services[7];
    if (service) setActiveService(service);
  }, [services]);

  useHotkey(scope, KeyBindings['app.switch_connection_9'], () => {
    const service = services[8];
    if (service) setActiveService(service);
  }, [services]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ipcRenderer.on('autoupdater:update-available', (_, info: AvailableUpdate) => {
        setAvailableUpdate(info);
      });

      function checkForUpdates() {
        ipcRenderer.send('autoupdater:check-for-updates');
      }

      checkForUpdates();
      setInterval(checkForUpdates, CHECK_FOR_UPDATES_INTERVAL);
    }
  }, []);

  useEffect(() => {
    if (services.length === 0) setLauncherVisible(true);
  }, [services]);

  useDidUpdateEffect(() => {
    saveConnections(connections);
  }, [connections]);

  async function handleConnect(connection: Connection) {
    if (services.map(e => e.connection).includes(connection)) return;

    const adapter = new PostgreSQLAdapter(connection);
    await adapter.connect();

    const service = { connection, adapter };

    setServices(state => [...state, service]);
    setActiveService(service);
    setLauncherVisible(false);
  }

  function handleDisconnect(service: Service) {
    service.adapter.disconnect();
    const conns = services.filter(e => e !== service);
    setServices(conns);

    if (conns.length > 0) {
      setActiveService(conns[0]);
    } else {
      setActiveService(null);
      setLauncherVisible(true);
    }
  }

  async function handleCreateConnection(connection: Connection) {
    const found = findExistingConnection(connections, connection);

    if (found) {
      const service = services.find(e => e.connection === found);

      if (service) {
        setActiveService(service);
        setLauncherVisible(false);
      } else {
        await handleConnect(found);
      }
    } else {
      await handleConnect(connection);
      setConnections(state => [...state, connection]);
    }
  }

  function handleDeleteConnection(connection: Connection) {
    const service = services.find(e => e.connection === connection);

    if (service) {
      handleDisconnect(service);
    }

    setConnections(state => state.filter(e => e !== connection));
  }

  return (
    <>
      {isLauncherVisible && (
        <Launcher
          connections={connections}
          services={services}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onCreateConnection={handleCreateConnection}
          onDeleteConnection={handleDeleteConnection}
          onClose={() => setLauncherVisible(false)}
        />
      )}

      {services.length > 0 && (
        <>
          <TitleBar
            availableUpdate={availableUpdate}
          />
          <Dock
            services={services}
            activeService={activeService}
            onActivateService={(service) => setActiveService(service)}
            onDisconnect={handleDisconnect}
            onShowLauncher={() => setLauncherVisible(true)}
          />
          {services.map(e =>
            <PostgreSQLServiceContext key={e.connection.uuid} service={e}>
              <PostgreSQLService isVisible={e === activeService} />
            </PostgreSQLServiceContext>
          )}
        </>
      )}
    </>
  );
}

export function App() {
  const [store, setStore] = useState<SecureStore | null>(null);
  const [connections, setConnections] = useState<Connection[] | null>(null);

  useEffect(() => {
    (async () => {
      const password = await getPasswordFromVault();
      const store = new SecureStore(password);

      setStore(store);
      setConnections(store.get('connections', []));
    })();
  }, []);

  return (
    <div className={styles.app}>
      {store && connections ? (
        <AppContext store={store}>
          <AppContent initialConnections={connections} />
        </AppContext>
      ) : (
        <Splash />
      )}
    </div>
  );
}
