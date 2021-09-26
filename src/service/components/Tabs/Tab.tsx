import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import Tippy from '@tippyjs/react/headless';
import { Entity } from '../../types';
import { TabTooltip } from './TabTooltip';
import styles from './Tab.scss';

interface SortableTabProps {
  entity: Entity;
  width: number;
  isActive: boolean;
  onActivate(entity: Entity): void;
  onClose(entity: Entity): void;
}

export function SortableTab(props: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(props.entity.id) });

  return (
    <Tab
      ref={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      transform={transform}
      transition={transition}
      isDragging={isDragging}
      {...props}
    />
  );
}

interface TabProps {
  entity: Entity;
  width: number;
  isActive?: boolean;
  onActivate?(entity: Entity): void;
  onClose?(entity: Entity): void;
  attributes?: any;
  listeners?: any;
  transform?: any;
  transition?: any;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export const Tab = forwardRef<HTMLDivElement, TabProps>(({
  entity,
  attributes,
  listeners,
  transform,
  transition,
  width,
  isActive = true,
  isDragging = false,
  isOverlay = false,
  onActivate,
  onClose,
}, ref) => {
  function handlePointerDown(ev: React.PointerEvent) {
    if (onActivate) onActivate(entity);
    if (listeners.onPointerDown) listeners.onPointerDown(ev);
  }

  function handleClick(ev: React.MouseEvent) {
    ev.preventDefault();
    onClose && onClose(entity);
  }

  const css = classNames(
    styles.tab,
    {
      [styles.active]: isActive,
      [styles.dragging]: isDragging,
    }
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width,
  };

  return (
    <div
      ref={ref}
      {...attributes}
      {...listeners}
      style={style}
      className={css}
      onPointerDown={handlePointerDown}
    >
      <Tippy
        disabled={isDragging || isOverlay}
        placement="bottom"
        delay={[1000, 100]}
        offset={[0, 5]}
        render={() => <TabTooltip entity={entity} />}
      >
        <div className={styles.tabContent}>
          <span>{entity.name}</span>
          <a
            href=""
            draggable="false"
            onPointerDown={ev => ev.stopPropagation()}
            onClick={handleClick}
          >x</a>
        </div>
      </Tippy>
    </div>
  );
});
