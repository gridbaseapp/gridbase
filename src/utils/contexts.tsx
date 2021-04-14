import React, { createContext, ReactNode, useContext } from 'react';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';

interface IServiceProvider {
  children: ReactNode;
  localStore: LocalStore;
  connection: IConnection;
}

interface IServiceContext {
  localStore: LocalStore;
  connection: IConnection;
}

const ServiceContext = createContext<IServiceContext>({} as IServiceContext);

export function useServiceContext() {
  const context = useContext(ServiceContext);

  if (context === undefined) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }

  return context;
}

export function ServiceProvider(props: IServiceProvider) {
  return (
    <ServiceContext.Provider
      value={{ localStore: props.localStore, connection: props.connection }}
    >
      {props.children}
    </ServiceContext.Provider>
  );
}
