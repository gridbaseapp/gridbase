import React, { useCallback, useRef } from 'react';

type Callback = (width: number) => void;

export function useResizable<T extends HTMLElement>(onResize: Callback) {
  const resizableElementRef = useRef<T | null>(null);

  const initialX = useRef(0);
  const initialWidth = useRef(0);

  const onMouseDown = useCallback((ev: React.MouseEvent) => {
    if (!resizableElementRef.current) return;

    function onMouseMove(event: MouseEvent) {
      const width = initialWidth.current + (event.clientX - initialX.current);
      onResize(width);
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    const { width } = resizableElementRef.current.getBoundingClientRect();

    initialX.current = ev.clientX;
    initialWidth.current = width || 0;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  return {
    resizableElementRef,
    resizableTrigger: onMouseDown,
  };
}
