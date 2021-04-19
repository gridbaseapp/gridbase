import React, { useEffect, useRef, useState } from 'react';
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
}

const TAB_WIDTH_THRESHOLD = 150;

function maxTabs(width: number) {
  return Math.ceil(width / TAB_WIDTH_THRESHOLD);
}

export default function Tabs(props: ITabsProps) {
  const tabsContainer = useRef<HTMLDivElement>(null);
  const [isMoreTabsVisible, setMoreTabsVisible] = useState(false);

  useEffect(() => {
    if (tabsContainer.current) {
      return tabable(tabsContainer.current, { drag: styles.drag, mirror: styles.mirror });
    }

    return undefined;
  });

  function onCloseEntity(ev: React.MouseEvent, entity: string) {
    ev.preventDefault();
    ev.stopPropagation();
    props.onCloseEntity(entity);
  }

  function onSelectMoreTab(entity: string) {
    props.onSelectEntity(entity);
    setMoreTabsVisible(false);
  }

  function onShowMoreTabs(ev: React.MouseEvent) {
    ev.preventDefault();
    setMoreTabsVisible(!isMoreTabsVisible);
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
                  placement="bottom-end"
                  interactive
                  visible={isMoreTabsVisible}
                  onClickOutside={() => setMoreTabsVisible(false)}
                  render={attrs => (
                    <div className={styles.moreTabsPopover}>
                      {[...props.entities].slice(maxTabs(width)).map(entity => (
                        <a
                          key={entity}
                          className={
                            classNames({ [styles.selected]: entity === props.selectedEntity })
                          }
                          onClick={() => onSelectMoreTab(entity)}
                        >
                          {entity}
                        </a>
                      ))}
                    </div>
                  )}
                >
                  <a className={styles.newTab} onClick={onShowMoreTabs}>...</a>
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
