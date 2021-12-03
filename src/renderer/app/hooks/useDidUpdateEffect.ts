import { useEffect, useRef } from 'react';

export function useDidUpdateEffect(fn: (...args: any) => any, deps: any[]) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      return fn();
    } else {
      didMountRef.current = true;
    }
  }, deps);
}
