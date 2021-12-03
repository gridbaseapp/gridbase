import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react/headless';
import { Splash } from './Splash';
import { Sidebar } from './Sidebar';
import { Tabs } from './Tabs';
import { GoTo } from './GoTo';
import { Table } from './Table';
import { Query } from './Query';
import styles from './PostgreSQLService.scss';
import { useServiceContext } from '../hooks';
import { useFocus, useHotkey } from '../../app/hooks';
import { EntityType } from '../types';
import { PostgreSQLAdapter } from '../adapter';

type FocusedSection = 'sidebar' | 'content';

interface Props {
  isVisible: boolean;
}

export function PostgreSQLService({ isVisible }: Props) {
  const {
    adapter,
    connection,
    entities,
    dataLoadingStatus,
    openEntityIds,
    activeEntityId,
    isDisconnected,
    setAdapter,
    setActiveEntityId,
    setDisconnected,
    loadData,
    closeEntity,
  } = useServiceContext();

  const [isGoToVisible, setGoToVisible] = useState(false);
  const [goToTriggerTargetRef, setGoToTriggerTargetRef] = useState<Element | null>(null);
  const [focusedSection, setFocusedSection] = useState<FocusedSection>('sidebar');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    adapter.onConnectionError(() => {
      setDisconnected(true);
    });
  }, [adapter]);

  useEffect(() => {
    setFocusedSection(openEntityIds.length === 0 ? 'sidebar' : 'content');
  }, [openEntityIds]);

  const scope = `Service-${connection.uuid}`;

  useFocus(scope, isVisible);

  useHotkey(scope, 'meta+t', () => {
    setGoToVisible(true);
  });

  useHotkey(scope, 'meta+w', () => {
    if (activeEntityId) closeEntity(activeEntityId);
  }, [entities, activeEntityId, openEntityIds]);

  useHotkey(scope, 'meta+shift+e', () => {
    if (openEntityIds.length === 0) {
      setFocusedSection('sidebar');
    } else {
      setFocusedSection(state => state === 'sidebar' ? 'content' : 'sidebar');
    }
  }, [openEntityIds]);

  useHotkey(scope, 'meta+shift+[', () => {
    if (!activeEntityId) return;
    if (openEntityIds.length === 0) return;

    let idx = openEntityIds.indexOf(activeEntityId);
    idx -= 1;
    if (idx === -1) idx = openEntityIds.length - 1;
    setActiveEntityId(openEntityIds[idx]);
  }, [activeEntityId, openEntityIds]);

  useHotkey(scope, 'meta+shift+]', () => {
    if (!activeEntityId) return;
    if (openEntityIds.length === 0) return;

    let idx = openEntityIds.indexOf(activeEntityId);
    idx += 1;
    if (idx >= openEntityIds.length) idx = 0;
    setActiveEntityId(openEntityIds[idx]);
  }, [activeEntityId, openEntityIds]);

  function handleClickOutside(instance: any, ev: Event) {
    if (!goToTriggerTargetRef?.contains(ev.target as Element)) {
      setGoToVisible(false);
    }
  }

  function handleReconnect() {
    const adapter = new PostgreSQLAdapter(connection)
    adapter.connect();
    setAdapter(adapter);
    setDisconnected(false);
  }

  const openEntities = entities.filter(e => openEntityIds.includes(e.id));

  return (
    <div className={classNames(styles.service, { hidden: !isVisible })}>
      {['reloading', 'success'].includes(dataLoadingStatus) ? (
        <>
          <Tippy
            placement="bottom"
            interactive
            visible={isGoToVisible}
            onClickOutside={handleClickOutside}
            render={() => isGoToVisible &&
              <GoTo onClose={() => setGoToVisible(false)} />
            }
          >
            <div className={styles.gotoPlaceholder}></div>
          </Tippy>

          <Sidebar
            hasFocus={focusedSection === 'sidebar'}
            onFocus={() => setFocusedSection('sidebar')}
          />

          <div className={styles.content}>
            <Tabs
              setGoToTriggerTargetRef={setGoToTriggerTargetRef}
              onShowGoTo={() => setGoToVisible(state => !state)}
            />

            {openEntities.map(entity => {
              switch (entity.type) {
                case EntityType.Table:
                case EntityType.View:
                case EntityType.MaterializedView:
                  return (
                    <Table
                      key={entity.id}
                      entity={entity}
                      isVisible={entity.id === activeEntityId}
                      hasFocus={entity.id === activeEntityId && focusedSection === 'content'}
                      onFocus={() => setFocusedSection('content')}
                    />
                  );
                case EntityType.Query:
                  return (
                    <Query
                      key={entity.id}
                      entity={entity}
                      isVisible={entity.id === activeEntityId}
                      hasFocus={entity.id === activeEntityId && focusedSection === 'content'}
                      onFocus={() => setFocusedSection('content')}
                    />
                  );
              }
            })}
          </div>

          {isDisconnected &&(
            <div className={styles.disconnectedBanner}>
              Connection error
              <a onClick={handleReconnect}>Reconnect</a>
            </div>
          )}
        </>
      ) : (
        <Splash />
      )}
    </div>
  );
}
