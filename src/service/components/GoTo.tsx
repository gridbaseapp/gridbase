import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useServiceContext } from '../hooks';
import styles from './GoTo.scss';
import { Entity } from '../types';
import { useExclusiveFocus, useHotkey } from '../../app/hooks';

interface Props {
  onClose(): void;
}

export function GoTo({ onClose }: Props) {
  const { entities, openEntity } = useServiceContext();

  const listRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState('');
  const [focusedEntityIndex, setFocusedEntityIndex] = useState(0);

  const filteredEntities = entities!.filter(({ name }) => {
    const query = filter.trim().toLowerCase();
    const lowercaseName = name.toLowerCase();

    return lowercaseName.includes(query);
  }).sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  function scrollToEntity(idx: number) {
    const entity = filteredEntities[idx];

    if (!entity) return;
    if (!listRef.current) return;

    const el = document.getElementById(`goto-entity-${entity.id}`)!;

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
    if (filterRef.current) filterRef.current.focus();
  }, []);

  useEffect(() => {
    setFocusedEntityIndex(0);
  }, [filter]);

  const scope = 'GoTo';

  useExclusiveFocus(scope);

  useHotkey(scope, 'escape', () => {
    onClose();
  });

  useHotkey(scope, 'arrowdown', () => {
    let idx = focusedEntityIndex + 1;
    if (idx > filteredEntities.length - 1) idx = 0;
    setFocusedEntityIndex(idx);
    scrollToEntity(idx);
  }, [filteredEntities]);

  useHotkey(scope, 'meta+arrowdown', () => {
    setFocusedEntityIndex(filteredEntities.length - 1);
    scrollToEntity(filteredEntities.length - 1);
  }, [filteredEntities]);

  useHotkey(scope, 'arrowup', () => {
    let idx = focusedEntityIndex - 1;
    if (idx < 0) idx = filteredEntities.length - 1;
    setFocusedEntityIndex(idx);
    scrollToEntity(idx);
  }, [filteredEntities]);

  useHotkey(scope, 'meta+arrowup', () => {
    setFocusedEntityIndex(0);
    scrollToEntity(0);
  }, [filteredEntities]);

  useHotkey(scope, 'enter', () => {
    const entity = filteredEntities[focusedEntityIndex];

    if (entity) {
      openEntity(entity.id);
      onClose();
    }
  }, [filteredEntities]);

  function handleFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function handleClickEntity(ev: React.MouseEvent, entity: Entity) {
    ev.preventDefault();
    openEntity(entity.id);
    onClose();
  }

  return (
    <div className={styles.goTo}>
      <input
        ref={filterRef}
        className={styles.filter}
        type="text"
        value={filter}
        onChange={handleFilter}
      />

      <div ref={listRef} className={styles.list}>
        {filteredEntities.map((entity, idx) => (
          <a
            id={`goto-entity-${entity.id}`}
            key={entity.id}
            className={classNames({ [styles.focus]: idx === focusedEntityIndex })}
            onClick={(ev) => handleClickEntity(ev, entity)}
          >
            [{entity.schema.name}] [{entity.type}] {entity.name}
          </a>
        ))}
      </div>
    </div>
  );
}
