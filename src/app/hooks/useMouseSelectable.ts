import React, { useCallback } from 'react';

interface SelectionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

interface IsScrollable {
  element: HTMLElement;
  isScrollableX: boolean;
  isScrollableY: boolean;
}

interface Args {
  onSelect(rect: SelectionRect): void;
  onEnd(): void;
}

const SCROLL_TRIGGER_MARGIN = 50;
const SCROLL_MOVEMENT_SPEED_FACTOR = 0.1;

const OVERFLOW_REGEX = /(auto|scroll|overlay)/;

function isScrollable(element: HTMLElement) {
  const styles = window.getComputedStyle(element);

  const isScrollableX = OVERFLOW_REGEX.test(styles.getPropertyValue('overflow-x'));
  const isScrollableY = OVERFLOW_REGEX.test(styles.getPropertyValue('overflow-y'));

  return { isScrollableX, isScrollableY };
}

function findScrollableAncestor(element: HTMLElement | null): IsScrollable | null {
  if (!element) {
    return null;
  }

  const scrollable = isScrollable(element);

  if (scrollable.isScrollableX || scrollable.isScrollableY) {
    return { element, ...scrollable };
  }

  return findScrollableAncestor(element.parentElement);
}

export function useMouseSelectable({ onSelect, onEnd }: Args) {
  return useCallback((ev: React.MouseEvent<HTMLElement>) => {
    const containerElement = ev.currentTarget;
    const scrollAncestor = findScrollableAncestor(containerElement);

    const containerRect = containerElement.getBoundingClientRect();
    const scrollRect = scrollAncestor?.element.getBoundingClientRect();

    const initialX = ev.clientX - containerRect.left;
    const initialY = ev.clientY - containerRect.top;

    let interval: NodeJS.Timeout | null;

    let moveByY = 0;
    let moveByX = 0;

    let scrollClientX = 0;
    let scrollClientY = 0;

    function getSelectionRect(clientX: number, clientY: number) {
      const rect = containerElement.getBoundingClientRect();

      let left = Math.min(clientX - rect.left, initialX);
      let top = Math.min(clientY - rect.top, initialY);
      let right = Math.max(clientX - rect.left, initialX);
      let bottom = Math.max(clientY - rect.top, initialY);

      if (left < 0) left = 0;
      if (top < 0) top = 0;

      if (right > containerRect.width) right = containerRect.width;
      if (bottom > containerRect.height) bottom = containerRect.height;

      return { left, top, right, bottom };
    };

    function getSelectionRectWhileScrolling() {
      return getSelectionRect(scrollClientX, scrollClientY);
    }

    function onMouseMove(ev: MouseEvent) {
      onSelect(getSelectionRect(ev.clientX, ev.clientY));

      if (!scrollAncestor || !scrollRect) return;

      const topRelativeToScrollElement = ev.clientY - scrollRect.top;
      const bottomRelativeToScrollElement = scrollRect.bottom - ev.clientY;
      const leftRelativeToScrollElement = ev.clientX - scrollRect.left;
      const rightRelativeToScrollElement = scrollRect.right - ev.clientX;

      if (!scrollAncestor.isScrollableX) {
        moveByX = 0;
      } else if (leftRelativeToScrollElement < SCROLL_TRIGGER_MARGIN) {
        moveByX = leftRelativeToScrollElement - SCROLL_TRIGGER_MARGIN;
      } else if (rightRelativeToScrollElement < SCROLL_TRIGGER_MARGIN) {
        moveByX = SCROLL_TRIGGER_MARGIN - rightRelativeToScrollElement;
      } else {
        moveByX = 0;
      }

      if (!scrollAncestor.isScrollableY) {
        moveByY = 0;
      } else if (topRelativeToScrollElement < SCROLL_TRIGGER_MARGIN) {
        moveByY = topRelativeToScrollElement - SCROLL_TRIGGER_MARGIN;
      } else if (bottomRelativeToScrollElement < SCROLL_TRIGGER_MARGIN) {
        moveByY = SCROLL_TRIGGER_MARGIN - bottomRelativeToScrollElement;
      } else {
        moveByY = 0;
      }

      moveByX = Math.round(moveByX * SCROLL_MOVEMENT_SPEED_FACTOR);
      moveByY = Math.round(moveByY * SCROLL_MOVEMENT_SPEED_FACTOR);

      scrollClientX = ev.clientX;
      scrollClientY = ev.clientY;

      if (moveByX !== 0 || moveByY !== 0) {
        if (!interval) {
          interval = setInterval(() => {
            scrollAncestor.element.scrollBy(moveByX, moveByY);
            onSelect(getSelectionRectWhileScrolling());
          }, 10);
        }
      } else {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    function onMouseUp() {
      onEnd();

      if (interval) clearInterval(interval);

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);
}
