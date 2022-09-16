import React, { useEffect, useState } from 'react';
import { useTransition } from '@react-spring/web';
import { Splash } from "./Splash";
import { SecureStore } from '../SecureStore';
import { Connection } from '../types';
import { AppContext } from './AppContext';
import { Main } from './Main';
import { MainContext } from './MainContext';
import { getPasswordFromVault } from '../vault';

import 'normalize.css';
import './App.scss';

export function App() {
  const [store, setStore] = useState<SecureStore | null>(null);
  const [connections, setConnections] = useState<Connection[] | null>(null);

  useEffect(() => {
    (async () => {
      // Display Splash screen for at least SPLASH_TIMEOUT to prevent flickering
      const timeout = new Promise((resolve) => {
        setTimeout(() => resolve(null), SPLASH_TIMEOUT);
      });

      const [password] = await Promise.all([getPasswordFromVault(), timeout]);

      const store = new SecureStore(password);
      const connections = store.get('connections', []);

      setStore(store);
      setConnections(connections);
    })();
  }, []);

  const splashTransition = useTransition(!store || !connections, {
    from: { opacity: 1, scale: 1 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 1.5 },
  });

  return (
    <>
      {splashTransition((style, visible) => visible && <Splash style={style} />)}

      {store && connections && (
        <AppContext store={store}>
          <MainContext>
            <Main />
          </MainContext>
        </AppContext>
      )}
    </>
  );
}
