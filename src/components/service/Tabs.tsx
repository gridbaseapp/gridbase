import React, { useEffect, useRef } from 'react';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import tabable from '../../utils/tabable';
import styles from './Tabs.scss';
import AutoSizer from '../AutoSizer';

interface ITabsProps {
  entities: string[];
  selectedEntity: string | undefined;
  onSelectEntity(entity: string): void;
  onCloseEntity(entity: string): void;
  onReorderEntities(entities: string[]): void;
}

const TAB_WIDTH_THRESHOLD = 150;

function maxTabs(width: number) {
  return Math.ceil(width / TAB_WIDTH_THRESHOLD);
}

export default function Tabs(props: ITabsProps) {
  const tabsContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsContainer.current) {
      return tabable(
        tabsContainer.current,
        { drag: styles.drag, mirror: styles.mirror },
        (order) => {
          const entities = order
            .map(i => props.entities[i])
            .concat(props.entities.slice(order.length));
          props.onReorderEntities(entities);
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
      <AutoSizer>
        {(width, _) =>
          <div className={styles.tabsContent}>
            <div className={styles.tabsContainer} ref={tabsContainer}>
              {[...props.entities].slice(0, maxTabs(width)).map(entity =>
                <Tippy
                  key={entity}
                  placement="top"
                  delay={[1000, 100]}
                  offset={[0, 5]}
                  render={attrs => (
                    <div className={styles.tooltip} {...attrs}>{entity}</div>
                  )}
                >
                  <span
                    className={
                      classNames(styles.tab, { [styles.selected]: entity === props.selectedEntity })
                    }
                    onMouseDown={() => props.onSelectEntity(entity)}
                  >
                    <span>{entity}</span>
                    <a
                      href=""
                      draggable="false"
                      onMouseDownCapture={(ev) => { ev.stopPropagation(); }}
                      onClick={(ev) => onCloseEntity(ev, entity)}
                    >x</a>
                  </span>
                </Tippy>
              )}
            </div>

            <div>
              {props.entities.length > maxTabs(width) &&
                <Tippy
                  trigger="click"
                  placement="bottom-end"
                  interactive
                  render={attrs => (
                    <div className={styles.moreTabsPopover}>
                      {[...props.entities].slice(maxTabs(width)).map(entity => (
                        <a
                          key={entity}
                          className={
                            classNames({ [styles.selected]: entity === props.selectedEntity })
                          }
                          onClick={() => props.onSelectEntity(entity)}
                        >
                          {entity}
                        </a>
                      ))}
                    </div>
                  )}
                >
                  <a className={styles.newTab}>...</a>
                </Tippy>
              }
            </div>

            <a className={styles.newTab}>+</a>
          </div>
        }
      </AutoSizer>
    </div>
  );
}
