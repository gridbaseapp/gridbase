import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import tabable from '../../utils/tabable';
import styles from './Tabs.scss';
import AutoSizer from '../AutoSizer';
import GoTo from './GoTo';
import {
  IEntity,
  IState,
  ENTITY_TYPE_HUMAN,
  closeEntity,
  reorderOpenEntities,
} from '../../state';

const TAB_WIDTH_THRESHOLD = 150;

function maxTabs(width: number) {
  return Math.ceil(width / TAB_WIDTH_THRESHOLD);
}

export default function Tabs() {
  const dispatch = useDispatch();

  const entities = useSelector((state: IState) => state.openEntities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);

  const tabsContainer = useRef<HTMLDivElement>(null);

  const [isMoreTabsVisible, setMoreTabsVisible] = useState(false);
  const [isGoToVisible, setGoToVisible] = useState(false);

  useEffect(() => {
    if (tabsContainer.current) {
      return tabable({
        container: tabsContainer.current,
        cssClass: { drag: styles.drag },
        onReorder: (order) => dispatch(reorderOpenEntities(order)),
        fastenElements: true,
      });
    }

    return undefined;
  }, []);

  function onCloseEntity(ev: React.MouseEvent, entity: IEntity) {
    ev.preventDefault();
    ev.stopPropagation();
    dispatch(closeEntity(entity));
  }

  function onSelectMoreTab(entity: IEntity) {
    dispatch({ type: 'selectedEntity/set', payload: entity });
    setMoreTabsVisible(false);
  }

  function onShowMoreTabs(ev: React.MouseEvent) {
    ev.preventDefault();
    setMoreTabsVisible(!isMoreTabsVisible);
  }

  function onTabMouseDown(entity: IEntity) {
    dispatch({ type: 'selectedEntity/set', payload: entity });
    setGoToVisible(false);
  }

  function onMouseDownCaptureEntity(ev: React.MouseEvent) {
    ev.stopPropagation();
    setGoToVisible(false);
  }

  return (
    <div className={styles.tabs}>
      <AutoSizer>
        {(width, _) =>
          <Tippy
            placement="bottom"
            interactive
            render={
              attrs => isGoToVisible && <GoTo onEntityClicked={() => setGoToVisible(false)} />
            }
            visible={isGoToVisible}
            onClickOutside={() => setGoToVisible(false)}
          >

            <div className={styles.tabsContent}>
              <div
                className={styles.tabsContainer}
                ref={tabsContainer}
                onClick={() => setGoToVisible(false)}
              >
                {[...entities].slice(0, maxTabs(width)).map(entity =>
                  <Tippy
                    key={entity.id}
                    placement="top"
                    delay={[1000, 100]}
                    offset={[0, 5]}
                    render={attrs => (
                      <div className={styles.tooltip} {...attrs}>
                        [{entity.schema?.name}] [{ENTITY_TYPE_HUMAN[entity.type]}] {entity.name}
                      </div>
                    )}
                  >
                    <span
                      className={
                        classNames(
                          styles.tab,
                          { [styles.selected]: entity.id === selectedEntity?.id },
                        )
                      }
                      onMouseDown={() => onTabMouseDown(entity)}
                    >
                      <span>{entity.name}</span>
                      <a
                        href=""
                        draggable="false"
                        onMouseDownCapture={onMouseDownCaptureEntity}
                        onClick={(ev) => onCloseEntity(ev, entity)}
                      >x</a>
                    </span>
                  </Tippy>
                )}
              </div>

              <div>
                {entities.length > maxTabs(width) &&
                  <Tippy
                    placement="bottom-end"
                    interactive
                    visible={isMoreTabsVisible}
                    onClickOutside={() => setMoreTabsVisible(false)}
                    render={attrs => (
                      <div className={styles.moreTabsPopover}>
                        {[...entities].slice(maxTabs(width)).map(entity => (
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
              </div>

              <a className={styles.newTab} onClick={() => setGoToVisible(!isGoToVisible)}>+</a>
            </div>
          </Tippy>
        }
      </AutoSizer>
    </div>
  );
}
