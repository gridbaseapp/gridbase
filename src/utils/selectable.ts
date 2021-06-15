import { COLUMNS_ROW_HEIGHT } from '../components/service/Table';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
};
type onMoveType = (rect: Rect) => void;

export default function selectable(
  target: HTMLElement,
  scrollNode: HTMLElement,
  onMove: onMoveType,
  onEnd: () => void,
) {
  const initCoords = { left: 0, top: 0 };

  let interval: ReturnType<typeof setInterval> | null = null;

  let moveByY = 0;
  let moveByX = 0;

  let scrollClientX = 0;
  let scrollClientY = 0;

  const getSelectionRect = (clientX: number | null, clientY: number | null) => {
    if (clientX === null) clientX = scrollClientX;
    if (clientY === null) clientY = scrollClientY;

    const contentRect = target.getBoundingClientRect();

    let x = clientX - contentRect.left;
    let y = clientY - contentRect.top;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    if (y > contentRect.height) y = contentRect.height;
    if (x > contentRect.width) y = contentRect.width;

    if (y - scrollNode.scrollTop < COLUMNS_ROW_HEIGHT) {
      y = scrollNode.scrollTop + COLUMNS_ROW_HEIGHT;
    }

    const width = Math.abs(x - initCoords.left);
    const height = Math.abs(y - initCoords.top);

    let left = initCoords.left;
    let top = initCoords.top;

    if (left > x) left = x;
    if (top > y) top = y;

    return { left, top, width, height };
  };

  const onMouseMove = (ev: MouseEvent) => {
    const outerRect = scrollNode.getBoundingClientRect();
    const contentRect = target.getBoundingClientRect();

    const relativeLeft = ev.clientX - contentRect.left - scrollNode.scrollLeft;
    const relativeTop = ev.clientY - contentRect.top - scrollNode.scrollTop;

    onMove(getSelectionRect(ev.clientX, ev.clientY));

    if (relativeTop - COLUMNS_ROW_HEIGHT < 50) {
      moveByY = Math.round((50 - Math.max(relativeTop - COLUMNS_ROW_HEIGHT, 0)) * -0.1);
    } else if (outerRect.height - relativeTop < 50) {
      moveByY = Math.round((50 - Math.max(outerRect.height - relativeTop, 0)) * 0.1);
    } else {
      moveByY = 0;
    }

    if (relativeLeft < 50) {
      moveByX = Math.round((50 - Math.max(relativeLeft, 0)) * -0.1);
    } else if (outerRect.width - relativeLeft < 50) {
      moveByX = Math.round((50 - Math.max(outerRect.width - relativeLeft, 0)) * 0.1);
    } else {
      moveByX = 0;
    }

    if (moveByX !== 0 || moveByY !== 0) {
      scrollClientX = ev.clientX;
      scrollClientY = ev.clientY;

      if (!interval) {
        interval = setInterval(() => {
          scrollNode.scrollBy(moveByX, moveByY);
          onMove(getSelectionRect(null, null));
        }, 10);
      }
    } else {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  };

  const onMouseUp = () => {
    initCoords.left = 0;
    initCoords.top = 0;

    moveByY = 0;
    moveByX = 0;

    onEnd();

    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const onMouseDown = (ev: MouseEvent) => {
    const contentRect = target.getBoundingClientRect();

    if (ev.clientY - contentRect.top - scrollNode.scrollTop < COLUMNS_ROW_HEIGHT) return;

    initCoords.left = ev.clientX - contentRect.left;
    initCoords.top = ev.clientY - contentRect.top;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  target.addEventListener('mousedown', onMouseDown);

  return () => {
    target.removeEventListener('mousedown', onMouseDown);
  };
};
