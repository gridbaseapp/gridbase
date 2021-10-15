import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react/headless';
import { Splash } from './Splash';
import { Sidebar } from './Sidebar';
import { Tabs } from './Tabs';
import { GoTo } from './GoTo';
import { Table } from './Table';
import styles from './PostgreSQLService.scss';
import { useServiceContext, useServiceStash } from '../hooks';
import { useDidUpdateEffect, useFocus, useHotkey } from '../../app/hooks';
import { Entity } from '../types';

type FocusedSection = 'sidebar' | 'table';

interface Props {
  isVisible: boolean;
}

export function PostgreSQLService({ isVisible }: Props) {
  const {
    adapter,
    connection,
    schemas,
    activeSchema,
    entities,
    openEntities,
    activeEntity,
    setSchemas,
    setActiveSchema,
    setEntities,
    setEntitiesStatus,
    setActiveEntity,
    closeEntity,
  } = useServiceContext();

  const [isGoToVisible, setGoToVisible] = useState(false);
  const [goToTriggerTargetRef, setGoToTriggerTargetRef] = useState<Element | null>(null);
  const [focusedSection, setFocusedSection] = useState<FocusedSection>('sidebar');
  const [
    openEntitiesStaticCopy,
    setOpenEntitiesStaticCopy,
  ] = useState<Entity[]>([...openEntities]);

  const [
    loadDefaultSchemaId,
    saveDefaultSchemaId,
  ] = useServiceStash<string>('defaultSchemaId');

  useEffect(() => {
    (async () => {
      const defaultSchemaId = loadDefaultSchemaId();
      const rows = await adapter.getSchemas();

      let active = rows.find(e => e.id === defaultSchemaId);
      if (!active) active = rows.find(e => e.name === 'public');
      if (!active) active = rows.filter(e => !e.internal)[0];
      if (!active) active = rows[0];

      setSchemas(rows);
      setActiveSchema(active);
    })()
  }, []);

  useDidUpdateEffect(() => {
    if (activeSchema) {
      saveDefaultSchemaId(activeSchema.id);
    }
  }, [activeSchema]);

  useEffect(() => {
    loadEntities();
  }, [activeSchema]);

  useEffect(() => {
    setOpenEntitiesStaticCopy(state => {
      const newState = [...state];

      openEntities.forEach(e => {
        if (!newState.includes(e)) newState.push(e);
      });

      return newState.filter(e => openEntities.includes(e));
    });
  }, [openEntities]);

  useEffect(() => {
    if (openEntitiesStaticCopy.length === 0) {
      setFocusedSection('sidebar');
    } else {
      setFocusedSection('table');
    }
  }, [openEntitiesStaticCopy, activeEntity]);

  const scope = `Service-${connection.uuid}`;

  useFocus(scope, isVisible);

  useHotkey(scope, 'cmd+t', () => {
    setGoToVisible(true);
  });

  useHotkey([scope, `Sidebar-${connection.uuid}`], 'cmd+r', () => {
    loadEntities();
  }, [activeSchema]);

  useHotkey(scope, 'cmd+w', () => {
    if (activeEntity) closeEntity(activeEntity);
  }, [activeEntity, openEntities]);

  useHotkey(scope, 'cmd+shift+e', () => {
    if (openEntities.length === 0) {
      setFocusedSection('sidebar');
    } else {
      setFocusedSection(state => state === 'sidebar' ? 'table' : 'sidebar');
    }
  });

  useHotkey(scope, 'cmd+shift+[', () => {
    if (!activeEntity) return;
    if (openEntities.length === 0) return;

    let idx = openEntities.indexOf(activeEntity);
    idx -= 1;
    if (idx === -1) idx = openEntities.length - 1;
    setActiveEntity(openEntities[idx]);
  }, [activeEntity, openEntities]);

  useHotkey(scope, 'cmd+shift+]', () => {
    if (!activeEntity) return;
    if (openEntities.length === 0) return;

    let idx = openEntities.indexOf(activeEntity);
    idx += 1;
    if (idx >= openEntities.length) idx = 0;
    setActiveEntity(openEntities[idx]);
  }, [activeEntity, openEntities]);

  async function loadEntities() {
    if (activeSchema) {
      setEntitiesStatus('loading');
      const rows = await adapter.getEntities(activeSchema.id);

      rows.forEach(e => e.schema = activeSchema);

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
      {schemas && activeSchema && entities ? (
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

            {openEntitiesStaticCopy.map(entity => (
              <Table
                key={entity.id}
                entity={entity}
                isVisible={entity === activeEntity}
                hasFocus={entity === activeEntity && focusedSection === 'table'}
              />
            ))}
          </div>
        </>
      ) : (
        <Splash />
      )}
    </div>
  );
}
