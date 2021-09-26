import { useAppContext } from "../../app/hooks";
import { useServiceContext } from "./useServiceContext";

export function useServiceStash<T>(key: string, defaultValue?: T) {
  const { stash } = useAppContext();
  const { connection } = useServiceContext();

  let scopedKey = `service-${connection.uuid}.${key}`;

  const load = () => {
    return <T>stash.get(scopedKey, defaultValue);
  };

  const save = (value: T) => {
    stash.set(scopedKey, value);
  };

  return [load, save] as const;
}
