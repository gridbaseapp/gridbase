import { useRef } from 'react';
import Store from "electron-store";
import { useServiceContext } from './useServiceContext';

export function useServiceStore<T>(key: string, defaultValue?: T) {
  const { connection } = useServiceContext();
  const store = useRef(new Store({ name: `config.service.${connection.uuid}` }));

  const load = () => {
    return <T>store.current.get(key, defaultValue);
  };

  const save = (value: T) => {
    store.current.set(key, value);
  };

  return [load, save] as const;
}
