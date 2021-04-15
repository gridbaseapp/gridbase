import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import tabable from '../../utils/tabable';
import styles from './Tabs.scss';

interface ITabsProps {
  entities: string[];
  selectedEntity: string | undefined;
  onSelectEntity(entity: string): void;
  onCloseEntity(entity: string): void;
  onReorderEntities(entities: string[]): void;
}

export default function Tabs(props: ITabsProps) {
  const tabsContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsContainer.current) {
      return tabable(
        tabsContainer.current,
        { drag: styles.drag, mirror: styles.mirror },
        (order) => {
          props.onReorderEntities(order.map(i => props.entities[i]));
        }
      );
    }

    return undefined;
  });

  function onCloseEntity(ev: React.MouseEvent, entity: string) {
    ev.preventDefault();
    ev.stopPropagation();
    props.onCloseEntity(entity);
  }

  return (
    <div className={styles.tabs}>
      <div ref={tabsContainer}>
        {props.entities.map(entity => <span
          className={classNames(styles.tab, { [styles.selected]: entity === props.selectedEntity })}
          key={entity}
          onMouseDown={() => props.onSelectEntity(entity)}
        >
          {entity}
          <a
            href=""
            draggable="false"
            onMouseDownCapture={(ev) => { ev.stopPropagation(); }}
            onClick={(ev) => onCloseEntity(ev, entity)}
          >x</a>
        </span>)}
      </div>
    </div>
  );
}
