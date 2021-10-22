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

  const filterRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState('');
  const [focusedEntityIndex, setFocusedEntityIndex] = useState(0);

  const filteredEntities = entities!.filter(({ name }) => {
    const query = filter.trim().toLowerCase();
    const lowercaseName = name.toLowerCase();

    return lowercaseName.includes(query);
  });

  useEffect(() => {
    if (filterRef.current) filterRef.current.focus();
  }, []);

  useEffect(() => {
    setFocusedEntityIndex(0);
  }, [filter]);

  const scope = 'GoTo';

  useExclusiveFocus(scope);

  useHotkey(scope, 'esc', () => {
    onClose();
  });

  useHotkey(scope, 'down', () => {
    let idx = focusedEntityIndex + 1;
    if (idx > filteredEntities.length - 1) idx = 0;
    setFocusedEntityIndex(idx);
  }, [filteredEntities]);

  useHotkey(scope, 'up', () => {
    let idx = focusedEntityIndex - 1;
    if (idx < 0) idx = filteredEntities.length - 1;
    setFocusedEntityIndex(idx);
  }, [filteredEntities]);

  useHotkey(scope, 'enter', () => {
    const entity = filteredEntities[focusedEntityIndex];

    if (entity) {
      openEntity(entity);
      onClose();
    }
  }, [filteredEntities]);

  function handleFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function handleClickEntity(ev: React.MouseEvent, entity: Entity) {
    ev.preventDefault();
    openEntity(entity);
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

      <div className={styles.list}>
        {filteredEntities.map((entity, idx) => (
          <a
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
