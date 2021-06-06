import React, { useEffect, useRef, useState } from 'react';

interface ISize {
  width: number;
  height: number;
}

interface IAutoSizerProps {
  children: (width: number, height: number) => React.ReactElement | null;
}

export default function AutoSizer({ children }: IAutoSizerProps) {
  const rootElement = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ISize>({ width: 0, height: 0 });

  useEffect(() => {
    if (!rootElement.current) return;

    // @ts-ignore
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({ width: rect.width, height: rect.height });
    });

    observer.observe(rootElement.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootElement} style={{ width: '100%', height: '100%' }}>
      {children(size.width, size.height)}
    </div>
  );
}
