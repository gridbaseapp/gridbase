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
import { Column } from '../../../types';
import { ColumnSettings } from './types';
import styles from './ColumnsSettingsModal.scss';
import { useExclusiveFocus, useHotkey } from '../../../../app/hooks';

interface Props {
  columns: Column[];
  onClose(): void;
  onApply(columns: Column[]): void;
}

export function ColumnsSettingsModal({
  columns,
  onClose,
  onApply,
}: Props) {
  const [items, setItems] = useState<ColumnSettings[]>(() => {
    return columns.map(({ name, isVisible, width }, position) => {
      return { name, isVisible, width, position };
    });
  });

  const [focusedItem, setFocusedItem] = useState<ColumnSettings | null>(null);

  const scope = 'ColumnsSettingsModal';

  useExclusiveFocus(scope);

  useHotkey(scope, 'escape', () => {
    onClose();
  });

  function handleClose(ev: React.MouseEvent) {
    ev.preventDefault();
    onClose();
  }

  function handleItemChange(item: ColumnSettings) {
    setItems(state => {
      const i = state.findIndex(e => e.name === item.name);

      const array = [
        ...state.slice(0, i),
        { ...item },
        ...state.slice(i + 1),
      ];

      return array
        .sort((a, b) => {
          if (a.isVisible && b.isVisible) {
            return 0;
          } else if (a.isVisible) {
            return -1;
          } else {
            return 1;
          }
        })
        .map((e, position) => ({ ...e, position }));
    });
  }

  const handleApply = (ev: React.MouseEvent) => {
    ev.preventDefault();

    const newColumns: Column[] = [];

    items.forEach(e => {
      const column = columns.find(col => col.name === e.name);

      if (column) {
        const order = e.isVisible ? column.sort.order : 'none';
        const position = e.isVisible ? column.sort.position : 0;

        newColumns.push({
          ...column,
          isVisible: e.isVisible,
          width: e.width,
          sort: { position, order },
        });
      }
    });

    [...newColumns]
      .sort((a, b) => a.sort.position - b.sort.position)
      .filter(e => e.sort.position > 0)
      .forEach((e, i) => e.sort.position = i + 1);

    onApply(newColumns);
  }

  function handleDragStart({ active }: DragStartEvent) {
    const item = items.find(e => e.name === active.id);
    if (item) setFocusedItem(item);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setFocusedItem(null);

    if (over && active.id !== over.id) {
      setItems(state => {
        const oldIndex = state.findIndex(e => e.name === active.id);
        const newIndex = state.findIndex(e => e.name === over.id);

        const array = arrayMove(state, oldIndex, newIndex);
        array.forEach((e, i) => e.position = i);

        return array;
      });
    }
  }

  const visibleItems = items.filter(e => e.isVisible);
  const hiddenItems = items.filter(e => !e.isVisible);

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={ev => ev.stopPropagation()}>
        <div className={styles.header}>
          <a onClick={handleApply}>apply</a>
          <a onClick={handleClose}>close</a>
        </div>

        <div className={styles.columnsHeader}>
          <span></span>
          <span>Visible</span>
          <span>Column</span>
          <span>Width</span>
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
                items={visibleItems.map(e => e.name)}
                strategy={verticalListSortingStrategy}
              >
                {visibleItems.map(item =>
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
            {hiddenItems.map(item =>
              <Item key={item.name} item={item} onChange={handleItemChange} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
