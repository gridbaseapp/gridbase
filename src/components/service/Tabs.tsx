import React, { useEffect, useState, forwardRef, useRef } from 'react';
import { throttle } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  LayoutMeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import styles from './Tabs.scss';
import GoTo from './GoTo';
import {
  IEntity,
  IState,
  ENTITY_TYPE_HUMAN,
  closeEntity,
  setOpenEntities,
} from '../../state';

const MIN_TAB_WIDTH = 150;
const DEFAULT_NUMBERS_OF_TABS = 4;

interface ISortableItemProps {
  entity: IEntity;
  tabWidth: number;
  className?: string;
  listeners?: any;
  attributes?: any;
  style?: any;
  selected: boolean;
  isDragging?: boolean;
  onSelect?: (entity: IEntity) => void;
  onClose?: (entity: IEntity) => void;
}

const Item = forwardRef<HTMLDivElement, ISortableItemProps>((props, ref) => {
  const {
    entity,
    tabWidth,
    onClose,
    onSelect,
    listeners,
    attributes,
    className,
    style,
    selected,
    isDragging,
    ...rest
  } = props;

  const stl = { ...style, width: tabWidth };

  const handleClick = (ev: React.MouseEvent) => {
    ev.preventDefault();
    onClose && onClose(entity);
  }

  const handlePointerDown = (ev: React.PointerEvent) => {
    if (onSelect) onSelect(entity);
    if (listeners.onPointerDown) listeners.onPointerDown(ev);
  }

  return (
    <div
      ref={ref}
      {...attributes}
      {...listeners}
      style={stl}
      {...rest}
      className={classNames(styles.tab, className, { [styles.selected]: selected })}
      onPointerDown={handlePointerDown}
    >
      <Tippy
        disabled={isDragging}
        placement="top"
        delay={[1000, 100]}
        offset={[0, 5]}
        render={attrs => (
          <div className={styles.tooltip} {...attrs}>
            [{entity.schema?.name}] [{ENTITY_TYPE_HUMAN[entity.type]}] {entity.name}
          </div>
        )}
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

function SortableItem(props: ISortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(props.entity.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const css = classNames({
    [styles.dragging]: isDragging,
  });

  return (
    <Item
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      className={css}
      entity={props.entity}
      tabWidth={props.tabWidth}
      selected={props.selected}
      isDragging={isDragging}
      onClose={props.onClose}
      onSelect={props.onSelect}
    />
  );
}

export default function Tabs() {
  const resizableRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const entities = useSelector((state: IState) => state.openEntities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);

  const [activeEntity, setActiveEntity] = useState<IEntity | null>(null);

  const [isMoreTabsVisible, setMoreTabsVisible] = useState(false);
  const [isGoToVisible, setGoToVisible] = useState(false);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!resizableRef.current) return;

    const onResize = throttle(entries => {
      const rect = entries[0].contentRect;
      setWidth(rect.width);
    }, 25);

    // @ts-ignore
    const observer = new ResizeObserver(onResize);

    observer.observe(resizableRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  function onCloseEntity(entity: IEntity) {
    dispatch(closeEntity(entity));
  }

  function onSelectEntity(entity: IEntity) {
    dispatch({ type: 'selectedEntity/set', payload: entity });
  }

  function onSelectMoreTab(entity: IEntity) {
    dispatch({ type: 'selectedEntity/set', payload: entity });
    setMoreTabsVisible(false);
  }

  function onShowMoreTabs(ev: React.MouseEvent) {
    ev.preventDefault();
    setMoreTabsVisible(!isMoreTabsVisible);
  }

  function handleShowGoTo(ev: React.MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    setGoToVisible(isGoToVisible => !isGoToVisible);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const col = entities.find(el => String(el.id) === String(active.id));

    if (col) setActiveEntity(col);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveEntity(null);

    if (over && active.id !== over.id) {
      const oldIndex = entities.findIndex(el => String(el.id) === String(active.id));
      const newIndex = entities.findIndex(el => String(el.id) === String(over.id));
      const newArray = arrayMove(entities, oldIndex, newIndex);

      dispatch(setOpenEntities(newArray));
    }
  }

  const maxNumberOfTabs = Math.floor(width / MIN_TAB_WIDTH);
  const maxTabWidth = width / Math.min(DEFAULT_NUMBERS_OF_TABS, maxNumberOfTabs);
  const tabWidth = Math.min(
    width / Math.min(entities.length, maxNumberOfTabs),
    maxTabWidth,
  ) || 0;

  const mainTabs = [...entities].slice(0, maxNumberOfTabs);
  const extraTabs = [...entities].slice(maxNumberOfTabs - 1);

  return (
    <Tippy
      placement="bottom"
      interactive
      render={
        attrs => isGoToVisible && <GoTo onEntityClicked={() => setGoToVisible(false)} />
      }
      visible={isGoToVisible}
      onClickOutside={() => setGoToVisible(false)}
    >
      <div className={styles.tabs} onClick={() => setGoToVisible(false)}>
        <div ref={resizableRef} className={styles.tabsContent}>
          <DndContext
            autoScroll={false}
            layoutMeasuring={{ strategy: LayoutMeasuringStrategy.Always }}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <SortableContext
              items={mainTabs.map(e => String(e.id))}
              strategy={horizontalListSortingStrategy}
            >
              {mainTabs.map(entity =>
                <SortableItem
                  key={String(entity.id)}
                  entity={entity}
                  tabWidth={tabWidth}
                  selected={selectedEntity.id === entity.id}
                  onClose={onCloseEntity}
                  onSelect={onSelectEntity}
                />
              )}
            </SortableContext>
            <DragOverlay>
              {activeEntity && <Item
                entity={activeEntity}
                tabWidth={tabWidth}
                selected={true}
                isDragging={true}
              />}
            </DragOverlay>
          </DndContext>
        </div>

        {extraTabs.length > 1 &&
          <Tippy
            placement="bottom-end"
            interactive
            visible={isMoreTabsVisible}
            onClickOutside={() => setMoreTabsVisible(false)}
            render={attrs => (
              <div className={styles.moreTabsPopover}>
                {extraTabs.map(entity => (
                  <a
                    key={entity.id}
                    className={
                      classNames({ [styles.selected]: entity.id === selectedEntity?.id })
                    }
                    onClick={() => onSelectMoreTab(entity)}
                  >
                    {entity.name}
                  </a>
                ))}
              </div>
            )}
          >
            <a className={styles.newTab} onClick={onShowMoreTabs}>...</a>
          </Tippy>
        }

        <a href="" className={styles.newTab} onClick={handleShowGoTo}>+</a>
      </div>
    </Tippy>
  );
}
