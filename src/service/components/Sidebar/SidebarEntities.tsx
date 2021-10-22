import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { Entity, EntityType } from '../../types';
import styles from './SidebarEntities.scss';
import { useServiceContext } from '../../hooks';
import { useFocus, useHotkey } from '../../../app/hooks';

interface Props {
  entityTypes: EntityType[];
}

export function SidebarEntities({ entityTypes }: Props) {
  const {
    connection,
    entities,
    entitiesStatus,
    activeEntity,
    openEntity,
  } = useServiceContext();

  const [filter, setFilter] = useState('');
  const [focusedEntityIndex, setFocusedEntityIndex] = useState(-1);
  const [highlightedEntities, setHighlightedEntities] = useState<Entity[]>([]);

  const filterElementRef = useRef<HTMLInputElement>(null);
  const focusedEntityFilter = useRef('');

  const clearFocusedEntityFilter = useCallback(debounce(() => {
    focusedEntityFilter.current = '';
    setHighlightedEntities([]);
  }, 1000), []);

  const filteredEntities = entities!.filter(({ name, type }) => {
    const query = filter.trim().toLowerCase();
    const lowercaseName = name.toLowerCase();

    return entityTypes.includes(type) && lowercaseName.includes(query);
  });

  useEffect(() => {
    setFocusedEntityIndex(-1);
  }, [filter]);

  useEffect(() => {
    const index = filteredEntities.findIndex(e => e.id === activeEntity?.id);
    setFocusedEntityIndex(index);
  }, [activeEntity]);

  const name = `SidebarEntities-${connection.uuid}`;
  const scopes = [
    `Service-${connection.uuid}`,
    `Sidebar-${connection.uuid}`,
    name,
  ];

  useFocus(name);

  useHotkey(scopes, 'cmd+f', () => {
    filterElementRef.current?.focus();
  });

  useHotkey(scopes, 'esc', () => {
    filterElementRef.current?.blur();

    if (filter != '') {
      setFilter('');
    }
  }, [filter]);

  useHotkey(scopes, 'down', () => {
    let idx = focusedEntityIndex + 1;
    if (idx > filteredEntities.length - 1) idx = -1;
    setFocusedEntityIndex(idx);
  }, [filteredEntities]);

  useHotkey(scopes, 'cmd+down', () => {
    setFocusedEntityIndex(filteredEntities.length - 1);
  }, [filteredEntities]);

  useHotkey(scopes, 'up', () => {
    let idx = focusedEntityIndex - 1;
    if (idx < -1) idx = filteredEntities.length - 1;
    setFocusedEntityIndex(idx);
  }, [filteredEntities]);

  useHotkey(scopes, 'cmd+up', () => {
    setFocusedEntityIndex(0);
  }, [filteredEntities]);

  useHotkey(scopes, 'enter', () => {
    const entity = filteredEntities[focusedEntityIndex];
    if (entity) openEntity(entity);
  }, [focusedEntityIndex]);

  useHotkey(scopes, 'alphabet', (ev) => {
    focusedEntityFilter.current += ev.key;

    const highlighted = filteredEntities.filter(e => {
      const filter = focusedEntityFilter.current.toLowerCase();
      const name = e.name.toLowerCase();

      return name.includes(filter);
    });

    setHighlightedEntities(highlighted)

    setFocusedEntityIndex(filteredEntities.indexOf(highlighted[0]));

    clearFocusedEntityFilter();
  }, [filteredEntities], { global: false });

  function handleClickEntity(ev: React.MouseEvent, entity: Entity) {
    setFocusedEntityIndex(filteredEntities.indexOf(entity));
    ev.preventDefault();
  }

  function handleOpenEntity(ev: React.MouseEvent, entity: Entity) {
    ev.preventDefault();
    openEntity(entity);
  }

  function handleFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  return (
    <div className={classNames(styles.sidebarEntities)}>
      {entitiesStatus === 'loading' && 'loading...'}

      {entities?.length === 0 && 'Nothing to show'}

      {entities?.length !== 0 && (
        <>
          {filteredEntities.length === 0 && (
            <div className={styles.noResults}>Nothing found</div>
          )}

          {filteredEntities.length > 0 && (
            <div className={styles.list}>
              {filteredEntities.map((entity, idx) => {
                const isOpaque = highlightedEntities.length > 0 &&
                  !highlightedEntities.includes(entity);

                const css = classNames({
                  [styles.active]: entity.id === activeEntity?.id,
                  [styles.focus]: idx === focusedEntityIndex,
                  [styles.dim]: isOpaque,
                });

                return (
                  <a
                    key={entity.id}
                    className={css}
                    onClick={(ev) => handleClickEntity(ev, entity)}
                    onDoubleClick={(ev) => handleOpenEntity(ev, entity)}
                  >
                    {entity.name}
                  </a>
                );
              })}
            </div>
          )}

          <div>
            <input
              ref={filterElementRef}
              className={styles.filter}
              type="text"
              placeholder="Filter"
              value={filter}
              onChange={handleFilter}
            />
          </div>
        </>
      )}
    </div>
  );
}
