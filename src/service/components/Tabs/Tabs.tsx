import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react/headless';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  MeasuringStrategy,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { useElementSize } from '../../../app/hooks';
import styles from './Tabs.scss';
import { Tab, SortableTab } from './Tab';
import { HiddenTabsDropdown } from './HiddenTabsDropdown';
import { useServiceContext } from '../../hooks';
import { Entity } from '../../types';

const MIN_TAB_WIDTH = 150;
const DEFAULT_NUMBERS_OF_TABS = 4;

interface Props {
  setGoToTriggerTargetRef(node: Element | null): void;
  onShowGoTo(): void;
}

export function Tabs({ setGoToTriggerTargetRef, onShowGoTo }: Props) {
  const [tabsContentRef, tabsContentSize] = useElementSize();

  const {
    entities,
    openEntityIds,
    activeEntityId,
    setOpenEntityIds,
    setActiveEntityId,
    closeEntity,
  } = useServiceContext();

  const [
    focusedEntity,
    setFocusedEntity,
  ] = useState<Entity>();

  const [isMoreTabsVisible, setMoreTabsVisible] = useState(false);

  const [maxNumberOfTabs, setMaxNumberOfTabs] = useState(0);
  const [tabWidth, setTabWidth] = useState(0);
  const [isTabResizingPrevented, setTabResizingPrevented] = useState(false);

  useEffect(() => {
    const { width } = tabsContentSize;
    const maxNumberOfTabs = Math.floor(width / MIN_TAB_WIDTH);
    const maxTabWidth = width / Math.min(DEFAULT_NUMBERS_OF_TABS, maxNumberOfTabs);
    const tabWidth = Math.min(
      width / Math.min(openEntityIds.length, maxNumberOfTabs),
      maxTabWidth,
    ) || 0;

    setMaxNumberOfTabs(maxNumberOfTabs);
    if (!isTabResizingPrevented) setTabWidth(tabWidth);
  }, [openEntityIds, tabsContentSize, isTabResizingPrevented]);

  function handleActivateEntity(entity: Entity) {
    setActiveEntityId(entity.id);
  }

  function handleShowMoreTabs(ev: React.MouseEvent) {
    ev.preventDefault();
    setMoreTabsVisible(state => !state);
  }

  function handleActivateHiddenTabsEntity(entity: Entity) {
    setActiveEntityId(entity.id);
    setMoreTabsVisible(false);
  }

  function handleShowGoTo(ev: React.MouseEvent) {
    ev.preventDefault();
    onShowGoTo();
  }

  function handleDragStart({ active }: DragStartEvent) {
    const entity = entities!.find(el => String(el.id) === active.id);
    if (entity) setFocusedEntity(entity);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setFocusedEntity(undefined);

    if (over && active.id !== over.id) {
      setOpenEntityIds(state => {
        const oldIndex = state.findIndex(id => String(id) === active.id);
        const newIndex = state.findIndex(id => String(id) === over.id);
        return arrayMove(state, oldIndex, newIndex);
      });
    }
  }

  let visibleTabs: Entity[] = [];
  let hiddenTabs: Entity[] = [];

  if (maxNumberOfTabs > 0) {
    visibleTabs = [...openEntityIds]
      .slice(0, maxNumberOfTabs)
      .map(id => entities!.find(e => e.id == id)!);
    hiddenTabs = [...openEntityIds]
      .slice(maxNumberOfTabs)
      .map(id => entities!.find(e => e.id == id)!);
  }

  return (
    <div
      className={styles.tabs}
      onPointerEnter={() => setTabResizingPrevented(true)}
      onPointerLeave={() => setTabResizingPrevented(false)}
    >
      <div ref={tabsContentRef} className={styles.tabsContent}>
        <DndContext
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          autoScroll={false}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleTabs.map(e => String(e.id))}
            strategy={horizontalListSortingStrategy}
          >
            {visibleTabs.map(entity =>
              <SortableTab
                key={entity.id}
                entity={entity}
                width={tabWidth}
                isActive={entity.id === activeEntityId}
                onActivate={handleActivateEntity}
                onClose={(entity) => closeEntity(entity.id)}
              />
            )}
          </SortableContext>

          <DragOverlay>
            {focusedEntity &&
              <Tab
                entity={focusedEntity}
                width={tabWidth}
                isOverlay={true}
              />
            }
          </DragOverlay>
        </DndContext>
      </div>

      {hiddenTabs.length > 0 && (
        <Tippy
          placement="bottom-end"
          interactive
          visible={isMoreTabsVisible}
          onClickOutside={() => setMoreTabsVisible(false)}
          render={() => (
            <HiddenTabsDropdown
              entities={hiddenTabs}
              onActivateEntity={handleActivateHiddenTabsEntity}
            />
          )}
        >
          <a className={styles.newTab} onClick={handleShowMoreTabs}>...</a>
        </Tippy>
      )}

      <a
        ref={setGoToTriggerTargetRef}
        className={styles.newTab}
        onClick={handleShowGoTo}
      >+</a>
    </div>
  );
}
