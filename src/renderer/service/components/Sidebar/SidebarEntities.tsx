import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { v4 as uuid } from 'uuid';
import { Entity, EntityType } from '../../types';
import styles from './SidebarEntities.scss';
import { useServiceContext } from '../../hooks';
import { useFocus, useHotkey } from '../../../app/hooks';
import { SidebarItem } from './SidebarItem';

interface Props {
  entityTypes: EntityType[];
}

export function SidebarEntities({ entityTypes }: Props) {
  const {
    connection,
    entities,
    dataLoadingStatus,
    activeEntityId,
    activeSchemaId,
    setEntities,
    openEntity,
    closeEntity,
  } = useServiceContext();

  const [filter, setFilter] = useState('');
  const [focusedEntityIndex, setFocusedEntityIndex] = useState(-1);
  const [editedEntityIndex, setEditedEntityIndex] = useState(-1);
  const [highlightedEntityIds, setHighlightedEntityIds] = useState<string[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const filterElementRef = useRef<HTMLInputElement>(null);
  const focusedEntityFilter = useRef('');

  const clearFocusedEntityFilter = useCallback(debounce(() => {
    focusedEntityFilter.current = '';
    setHighlightedEntityIds([]);
  }, 1000), []);

  const filteredEntities = entities
    .filter(entity => {
      const query = filter.trim().toLowerCase();
      const lowercaseName = entity.name.toLowerCase();

      const matchSchema = entity.schemaId === activeSchemaId;
      const matchType = entityTypes.includes(entity.type);
      const matchQuery = lowercaseName.includes(query);
      const isNew = entity.status === 'new'

      return matchSchema && matchType && matchQuery && !isNew;
    })
    .sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

  function scrollToEntity(idx: number) {
    const entity = filteredEntities[idx];

    if (!entity) return;
    if (!listRef.current) return;

    const el = document.getElementById(`sidebar-entity-${entity.id}`)!;

    const scrollTop = listRef.current.scrollTop;
    const listRect = listRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.top < listRect.top) {
      listRef.current.scrollTo({ top: scrollTop - (listRect.top - elRect.top) });
    }

    if (elRect.bottom > listRect.bottom) {
      listRef.current.scrollTo({ top: scrollTop - (listRect.bottom - elRect.bottom) });
    }
  }

  useEffect(() => {
    setFocusedEntityIndex(-1);
  }, [filter]);

  useEffect(() => {
    const index = filteredEntities.findIndex(e => e.id === activeEntityId);
    setFocusedEntityIndex(index);
  }, [entities, activeEntityId]);

  const name = `SidebarEntities-${connection.uuid}`;
  const scopes = [
    `Service-${connection.uuid}`,
    `Sidebar-${connection.uuid}`,
    name,
  ];

  useFocus(name);

  useHotkey(scopes, 'meta+f', () => {
    filterElementRef.current?.focus();
  });

  useHotkey(scopes, 'escape', () => {
    filterElementRef.current?.blur();

    if (filter != '') {
      setFilter('');
    }
  }, [filter]);

  useHotkey(scopes, 'arrowdown', () => {
    let idx = focusedEntityIndex + 1;
    if (idx > filteredEntities.length - 1) idx = -1;
    setFocusedEntityIndex(idx);
    scrollToEntity(idx);
  }, [filteredEntities], { global: false });

  useHotkey(scopes, 'meta+arrowdown', () => {
    setFocusedEntityIndex(filteredEntities.length - 1);
    scrollToEntity(filteredEntities.length - 1);
  }, [filteredEntities], { global: false });

  useHotkey(scopes, 'arrowup', () => {
    let idx = focusedEntityIndex - 1;
    if (idx < -1) idx = filteredEntities.length - 1;
    setFocusedEntityIndex(idx);
    scrollToEntity(idx);
  }, [filteredEntities], { global: false });

  useHotkey(scopes, 'meta+arrowup', () => {
    setFocusedEntityIndex(0);
    scrollToEntity(0);
  }, [filteredEntities], { global: false });

  useHotkey(scopes, 'enter', () => {
    const entity = filteredEntities[focusedEntityIndex];
    if (entity) openEntity(entity.id);
  }, [focusedEntityIndex], { global: false });

  useHotkey(scopes, 'alphabet', (ev) => {
    focusedEntityFilter.current += ev.key;

    const highlighted = filteredEntities.filter(e => {
      const filter = focusedEntityFilter.current.toLowerCase();
      const name = e.name.toLowerCase();

      return name.includes(filter);
    });

    setHighlightedEntityIds(highlighted.map(e => e.id));

    const idx = filteredEntities.indexOf(highlighted[0]);
    setFocusedEntityIndex(idx);
    scrollToEntity(idx);

    clearFocusedEntityFilter();
  }, [filteredEntities], { global: false });

  useHotkey(scopes, 'meta+e', () => {
    setEditedEntityIndex(focusedEntityIndex);
  }, [filteredEntities, focusedEntityIndex]);

  function handleClickEntity(entity: Entity) {
    setFocusedEntityIndex(filteredEntities.indexOf(entity));
  }

  function handleOpenEntity(entity: Entity) {
    openEntity(entity.id);
  }

  function handleUpdateEntity(entity: Entity) {
    setEditedEntityIndex(-1);

    setEntities(state => {
      const i = state.findIndex(e => e.id === entity.id);

      return [
        ...state.slice(0, i),
        { ...entity, name: entity.name, status: 'fresh' },
        ...state.slice(i + 1),
      ];
    });
  }

  function handleDeleteEntity(entity: Entity) {
    closeEntity(entity.id);
    setEntities(state => state.filter(e => e.id !== entity.id));
  }

  function handleFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function handleClickNewQuery(ev: React.MouseEvent) {
    ev.preventDefault();

    const entity: Entity = {
      id: uuid(),
      name: '[Draft Query]',
      type: EntityType.Query,
      schemaId: activeSchemaId!,
      canSelect: true,
      status: 'new',
    };

    setEntities(state => [...state, entity]);
    openEntity(entity.id);
  }

  return (
    <div className={classNames(styles.sidebarEntities)}>
      {dataLoadingStatus === 'reloading' && 'loading...'}

      {entities.length === 0 && 'Nothing to show'}

      {entities.length !== 0 && (
        <>
          {filteredEntities.length === 0 && (
            <div className={styles.noResults}>Nothing found</div>
          )}

          {filteredEntities.length > 0 && (
            <div ref={listRef} className={styles.list}>
              {filteredEntities.map((entity, idx) => {
                const isOpaque = (
                  (highlightedEntityIds.length > 0 && !highlightedEntityIds.includes(entity.id))
                  ||
                  (editedEntityIndex > -1 && editedEntityIndex !== idx)
                );

                return (
                  <SidebarItem
                    key={entity.id}
                    entity={entity}
                    isActive={entity.id === activeEntityId}
                    isFocused={idx === focusedEntityIndex}
                    isOpaque={isOpaque}
                    isEdited={editedEntityIndex === idx}
                    onClick={handleClickEntity}
                    onDoubleClick={handleOpenEntity}
                    onEdit={() => setEditedEntityIndex(idx)}
                    onCancel={() => setEditedEntityIndex(-1)}
                    onUpdate={handleUpdateEntity}
                    onDelete={handleDeleteEntity}
                  />
                );
              })}
            </div>
          )}

          <div>
            {entityTypes.includes(EntityType.Query) && (
              <a onClick={handleClickNewQuery}>New Query</a>
            )}

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
