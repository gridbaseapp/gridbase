import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnSettings } from './types';
import { COLUMN_MIN_WIDTH, COLUMN_MAX_WIDTH } from '../constants';
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
  const [width, setWidth] = useState(String(item.width));

  function handleChangeVisible(ev: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange({ ...item, isVisible: ev.target.checked });
    }
  }

  function handleBlurWidth(ev: React.FocusEvent<HTMLInputElement>) {
    let value = Number(ev.target.value);

    if (value < COLUMN_MIN_WIDTH) value = COLUMN_MIN_WIDTH;
    if (value > COLUMN_MAX_WIDTH) value = COLUMN_MAX_WIDTH;

    setWidth(String(value));

    if (onChange) {
      onChange({ ...item, width: value });
    }
  }

  function handleChangeWidth(ev: React.ChangeEvent<HTMLInputElement>) {
    setWidth(ev.target.value);
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
          onChange={handleChangeVisible}
        />
      </span>
      <span>{item.name}</span>
      <span>
        <input
          className={styles.columnWidthInput}
          type="number"
          value={width}
          onChange={handleChangeWidth}
          onBlur={handleBlurWidth}
          disabled={!item.isVisible}
        />
      </span>
      <span>{item.isVisible && item.position + 1}</span>
    </div>
  );
});
