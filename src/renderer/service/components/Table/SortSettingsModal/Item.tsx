import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order, SortSettings } from './types';
import styles from './Item.scss';

interface SortableItemProps {
  item: SortSettings;
  onChange?(item: SortSettings): void;
}

export function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.item.name });

  return (
    <Item
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

interface ItemProps {
  item: SortSettings;
  onChange?(item: SortSettings): void;
  attributes?: any;
  listeners?: any;
  transform?: any;
  transition?: any;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export const Item = forwardRef<HTMLDivElement, ItemProps>(({
  item,
  attributes,
  listeners,
  transform,
  transition,
  isDragging = false,
  isOverlay = false,
  onChange,
}, ref) => {
  function handleChangeEnabled(ev: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      const isEnabled = ev.target.checked;
      const order: Order = isEnabled ? item.order : 'asc';

      onChange({ ...item, isEnabled, order });
    }
  }

  function handleChangeOrder(ev: React.ChangeEvent<HTMLSelectElement>) {
    if (onChange) {
      onChange({ ...item, order: ev.target.value as Order });
    }
  }

  const css = classNames(
    styles.item,
    {
      [styles.dragging]: isDragging,
      [styles.overlay]: isOverlay,
      [styles.disabled]: !item.isEnabled,
    },
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div ref={ref} style={style} className={css}>
      <span {...attributes} {...listeners}>&#8597;</span>
      <span>
        <input
          type="checkbox"
          checked={item.isEnabled}
          onChange={handleChangeEnabled}
        />
      </span>
      <span>{item.name}</span>
      <span>
        <select
          value={item.order}
          onChange={handleChangeOrder}
          disabled={!item.isEnabled}
        >
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>

      </span>
      <span>{item.isEnabled && item.position + 1}</span>
    </div>
  );
});
