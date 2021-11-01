import React, { useCallback, useRef } from 'react';

type Callback = ({ width, height }: { width: number, height: number }) => void;

interface Options {
  direction: 'row' | 'col';
}

export function useResizable<T extends HTMLElement>(
  onResize: Callback,
  options: Options = { direction: 'col' },
) {
  const resizableElementRef = useRef<T | null>(null);

  const initialX = useRef(0);
  const initialY = useRef(0);
  const initialWidth = useRef(0);
  const initialHeight = useRef(0);

  const onMouseDown = useCallback((ev: React.MouseEvent) => {
    if (!resizableElementRef.current) return;

    function onMouseMove(event: MouseEvent) {
      const width = initialWidth.current + (event.clientX - initialX.current);
      const height = initialHeight.current + (event.clientY - initialY.current);
      onResize({ width, height });
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    const { width, height } = resizableElementRef.current.getBoundingClientRect();

    initialX.current = ev.clientX;
    initialY.current = ev.clientY;
    initialWidth.current = width || 0;
    initialHeight.current = height || 0;

    document.body.style.cursor = `${options.direction}-resize`;
    document.body.style.userSelect = 'none';
  }, []);

  return {
    resizableElementRef,
    resizableTrigger: onMouseDown,
  };
}
