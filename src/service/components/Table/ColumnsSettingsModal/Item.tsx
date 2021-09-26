import React, { forwardRef} from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnSettings } from './types';
import styles from './Item.scss';

interface SortableItemProps {
  item: ColumnSettings;
  onChange(item: ColumnSettings): void;
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
  item: ColumnSettings;
  onChange?(item: ColumnSettings): void;
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
  function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange({ ...item, isVisible: ev.target.checked });
    }
  }

  const css = classNames(
    styles.item,
    {
      [styles.dragging]: isDragging,
      [styles.overlay]: isOverlay,
      [styles.disabled]: !item.isVisible,
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
          checked={item.isVisible}
          onChange={handleChange}
        />
      </span>
      <span>{item.name}</span>
      <span>{item.isVisible && item.position + 1}</span>
    </div>
  );
});
