import { useAppContext } from "./useAppContext";

export function useSecureStore<T>(key: string) {
  const { store } = useAppContext();

  const load = () => {
    return <T>store.get(key);
  };

  const save = (value: T) => {
    store.set(key, value);
  };

  return [load, save] as const;
}
