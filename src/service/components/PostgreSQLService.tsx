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
import { useServiceContext, useServiceStash } from '../hooks';
import { useDidUpdateEffect, useFocus, useHotkey } from '../../app/hooks';
import { EntityType, SqlQuery } from '../types';

type FocusedSection = 'sidebar' | 'content';

interface Props {
  isVisible: boolean;
}

export function PostgreSQLService({ isVisible }: Props) {
  const {
    adapter,
    connection,
    schemas,
    activeSchemaId,
    entities,
    openEntityIds,
    activeEntityId,
    setSchemas,
    setActiveSchemaId,
    setEntities,
    setEntitiesStatus,
    setActiveEntityId,
    closeEntity,
  } = useServiceContext();

  const [isGoToVisible, setGoToVisible] = useState(false);
  const [goToTriggerTargetRef, setGoToTriggerTargetRef] = useState<Element | null>(null);
  const [focusedSection, setFocusedSection] = useState<FocusedSection>('sidebar');
  const [
    openEntityIdsStaticCopy,
    setOpenEntityIdsStaticCopy,
  ] = useState<string[]>([...openEntityIds]);

  const [
    loadDefaultSchemaId,
    saveDefaultSchemaId,
  ] = useServiceStash<string>('defaultSchemaId');

  const [
    loadSqlQueries,
  ] = useServiceStash<SqlQuery[]>(`queries.${activeSchemaId}`, []);

  useEffect(() => {
    (async () => {
      const defaultSchemaId = loadDefaultSchemaId();
      const rows = await adapter.getSchemas();

      let active = rows.find(e => e.id === defaultSchemaId);
      if (!active) active = rows.find(e => e.name === 'public');
      if (!active) active = rows.filter(e => !e.internal)[0];
      if (!active) active = rows[0];

      setSchemas(rows);
      setActiveSchemaId(active.id);
    })()
  }, []);

  useDidUpdateEffect(() => {
    if (activeSchemaId) {
      saveDefaultSchemaId(activeSchemaId);
    }
  }, [activeSchemaId]);

  useEffect(() => {
    loadEntities();
  }, [activeSchemaId]);

  useEffect(() => {
    setOpenEntityIdsStaticCopy(state => {
      const newState = [...state];

      openEntityIds.forEach(e => {
        if (!newState.includes(e)) newState.push(e);
      });

      return newState.filter(e => openEntityIds.includes(e));
    });
  }, [openEntityIds]);

  useEffect(() => {
    if (openEntityIdsStaticCopy.length === 0) {
      setFocusedSection('sidebar');
    } else {
      setFocusedSection('content');
    }
  }, [openEntityIdsStaticCopy, activeEntityId]);

  const scope = `Service-${connection.uuid}`;

  useFocus(scope, isVisible);

  useHotkey(scope, 'meta+t', () => {
    setGoToVisible(true);
  });

  useHotkey([scope, `Sidebar-${connection.uuid}`], 'meta+r', () => {
    loadEntities();
  }, [activeSchemaId]);

  useHotkey(scope, 'meta+w', () => {
    if (activeEntityId) closeEntity(activeEntityId);
  }, [entities, activeEntityId, openEntityIds]);

  useHotkey(scope, 'meta+shift+e', () => {
    if (openEntityIds.length === 0) {
      setFocusedSection('sidebar');
    } else {
      setFocusedSection(state => state === 'sidebar' ? 'content' : 'sidebar');
    }
  });

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

  async function loadEntities() {
    const activeSchema = schemas?.find(e => e.id === activeSchemaId);

    if (activeSchemaId && activeSchema) {
      setEntitiesStatus('loading');
      const rows = await adapter.getEntities(activeSchemaId);
      const sqlQueries = loadSqlQueries();

      rows.forEach(e => e.schema = activeSchema);

      sqlQueries.forEach(e => {
        rows.push({
          id: e.id,
          name: e.name,
          type: EntityType.Query,
          schema: activeSchema,
          status: 'fresh',
        });
      });

      setEntities(rows);
      setEntitiesStatus('success');
    }
  }

  function handleClickOutside(instance: any, ev: Event) {
    if (!goToTriggerTargetRef?.contains(ev.target as Element)) {
      setGoToVisible(false);
    }
  }

  return (
    <div className={classNames(styles.service, { hidden: !isVisible })}>
      {schemas && activeSchemaId && entities ? (
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

            {openEntityIdsStaticCopy.map(id => {
              const entity = entities.find(e => e.id === id);

              if (!entity) return;

              switch (entity.type) {
                case EntityType.Table:
                case EntityType.View:
                case EntityType.MaterializedView:
                  return (
                    <Table
                      key={id}
                      entity={entity}
                      isVisible={id === activeEntityId}
                      hasFocus={id === activeEntityId && focusedSection === 'content'}
                      onFocus={() => setFocusedSection('content')}
                    />
                  );
                case EntityType.Query:
                  return (
                    <Query
                      key={id}
                      entity={entity}
                      isVisible={id === activeEntityId}
                      hasFocus={id === activeEntityId && focusedSection === 'content'}
                      onFocus={() => setFocusedSection('content')}
                    />
                  );
              }
            })}
          </div>
        </>
      ) : (
        <Splash />
      )}
    </div>
  );
}
