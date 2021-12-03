import React, { useState } from 'react';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { Item, SortableItem } from './Item';
import { Column, SortOrder } from '../../../types';
import { SortSettings } from './types';
import styles from './SortSettingsModal.scss';
import { useExclusiveFocus, useHotkey } from '../../../../app/hooks';
import { isEnabledComparator, mapColumnsToSortSettings } from './utils';

interface Props {
  columns: Column[];
  onClose(): void;
  onApply(columns: Column[]): void;
}

export function SortSettingsModal({
  columns,
  onClose,
  onApply,
}: Props) {
  const [items, setItems] = useState<SortSettings[]>(() => {
    return mapColumnsToSortSettings(columns);
  });

  const [focusedItem, setFocusedItem] = useState<SortSettings | null>(null);

  const scope = 'SortSettingsModal';

  useExclusiveFocus(scope);

  useHotkey(scope, 'escape', () => {
    onClose();
  });

  function handleClose(ev: React.MouseEvent) {
    ev.preventDefault();
    onClose();
  }

  function handleItemChange(item: SortSettings) {
    setItems(state => {
      const i = state.findIndex(e => e.name === item.name);

      const array = [
        ...state.slice(0, i),
        { ...item },
        ...state.slice(i + 1),
      ];

      return array
        .sort(isEnabledComparator)
        .map((e, position) => ({ ...e, position }));
    });
  }

  const handleApply = (ev: React.MouseEvent) => {
    ev.preventDefault();

    const newColumns = columns.map(column => {
      const item = items.find(e => e.name === column.name);

      if (item) {
        const position = item.isEnabled ? item.position + 1 : 0;
        const order: SortOrder = item.isEnabled ? item.order : 'none';

        return { ...column, sort: { position, order } };
      } else {
        return { ...column };
      }
    });

    onApply(newColumns);
  }

  function handleDragStart({ active }: DragStartEvent) {
    const item = items.find(el => el.name === active.id);
    if (item) setFocusedItem(item);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setFocusedItem(null);

    if (over && active.id !== over.id) {
      setItems(state => {
        const oldIndex = items.findIndex(e => e.name === active.id);
        const newIndex = items.findIndex(e => e.name === over.id);

        const newArray = arrayMove(state, oldIndex, newIndex);
        newArray.forEach((e, i) => e.position = i);

        return newArray;
      });
    }
  }

  const enabledItems = items.filter(e => e.isEnabled);
  const disabledItems = items.filter(e => !e.isEnabled);

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={ev => ev.stopPropagation()}>
        <div className={styles.header}>
          <a onClick={handleApply}>apply</a>
          <a onClick={handleClose}>close</a>
        </div>

        <div className={styles.columnsHeader}>
          <span></span>
          <span>Enabled</span>
          <span>Column</span>
          <span>Order</span>
          <span>Position</span>
        </div>

        <div className={styles.content}>
          <div className={styles.scrollableContainer}>
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={enabledItems.map(e => e.name)}
                strategy={verticalListSortingStrategy}
              >
                {enabledItems.map(item =>
                  <SortableItem
                    key={item.name}
                    item={item}
                    onChange={handleItemChange}
                  />
                )}
              </SortableContext>

              <DragOverlay>
                {focusedItem && <Item item={focusedItem} isOverlay={true} />}
              </DragOverlay>
            </DndContext>
          </div>

          <div>
            {disabledItems.map(item =>
              <Item key={item.name} item={item} onChange={handleItemChange} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
