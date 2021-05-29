import { throttle } from 'lodash';

const MIN_WIDTH = 40;

export default function resizable(
  container: HTMLElement,
  trigger: HTMLElement,
  onResize: (width: number) => void,
) {
  const throttledOnResize = throttle(onResize, 25);

  function mousedown(ev: MouseEvent) {
    ev.stopPropagation();

    document.body.style.cursor = 'col-resize';
    const initialX = ev.clientX;
    const initialContainerWidth = container.getBoundingClientRect().width;

    const mousemove = (ev: MouseEvent) => {
      let width = initialContainerWidth + (ev.clientX - initialX);
      if (width < MIN_WIDTH) width = MIN_WIDTH;
      throttledOnResize(width);
    }

    const mouseup = () => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
      document.body.style.cursor = '';
    }

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  trigger.addEventListener('mousedown', mousedown);

  return function cleanup() {
    trigger.removeEventListener('mousedown', mousedown);
  }
}
