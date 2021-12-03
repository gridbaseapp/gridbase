import { useAppContext } from "./useAppContext";

export function useAppSecureStash<T>(key: string) {
  const { stash } = useAppContext();

  const load = () => {
    return <T>stash.getSecure(key);
  };

  const save = (value: T) => {
    stash.setSecure(key, value);
  };

  return [load, save] as const;
}
