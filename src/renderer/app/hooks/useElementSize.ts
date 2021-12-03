import { useCallback, useRef, useState } from 'react';
import { throttle } from 'lodash';

export function useElementSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const observer = useRef<ResizeObserver>();

  const ref = useCallback((node: HTMLElement | null) => {
    if (node) {
      const handleResize = throttle(entries => {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }, 25);

      observer.current = new ResizeObserver(handleResize);
      observer.current.observe(node);
    } else {
      observer.current?.disconnect();
    }
  }, []);

  return [ref, size] as const;
}
