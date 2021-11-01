import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react/headless';
import { Entity, EntityType, SqlQuery } from '../../types';
import { useFocus, useHotkey } from '../../../app/hooks';
import styles from './SidebarItem.scss';
import { useServiceContext, useServiceStash } from '../../hooks';

interface Props {
  entity: Entity;
  isActive: boolean;
  isFocused: boolean;
  isOpaque: boolean;
  isEdited: boolean;
  onClick(entity: Entity): void
  onDoubleClick(entity: Entity): void;
  onEdit(): void;
  onUpdate(entity: Entity): void;
  onDelete(entity: Entity): void;
}

export function SidebarItem({
  entity,
  isActive,
  isFocused,
  isOpaque,
  isEdited,
  onClick,
  onDoubleClick,
  onEdit,
  onUpdate,
  onDelete,
}: Props) {
  const { connection } = useServiceContext();

  const [
    loadSqlQueries,
    saveSqlQueries,
  ] = useServiceStash<SqlQuery[]>(`queries.${entity.schema.id}`, []);

  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(entity.name);
  const [isMenuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    isEdited && inputRef.current?.focus();
    setValue(entity.name);
  }, [isEdited]);

  const name = `SidebarItem-${entity.id}`;
  const scopes = [
    `Service-${connection.uuid}`,
    `Sidebar-${connection.uuid}`,
    `SidebarEntities-${connection.uuid}`,
    name,
  ];

  useFocus(name, isEdited);

  useHotkey(scopes, 'meta+s, enter', () => {
    handleUpdate();
  }, [value]);

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    setValue(ev.target.value);
  }

  function handleUpdate() {
    const queries = loadSqlQueries();
    const idx = queries.findIndex(e => e.id === entity.id);

    if (idx > -1) {
      queries[idx].name = value;
      saveSqlQueries(queries);
    }

    onUpdate({ ...entity, name: value });
  }

  function handleDelete() {
    const queries = loadSqlQueries();
    saveSqlQueries(queries.filter(e => e.id !== entity.id));

    onDelete(entity);
  }

  const css = classNames(styles.sidebarItem, {
    [styles.active]: isActive,
    [styles.focus]: isFocused,
    [styles.dim]: isOpaque,
  });

  return (
    <div
      id={`sidebar-entity-${entity.id}`}
      className={css}
      onClick={() => onClick(entity)}
      onDoubleClick={() => onDoubleClick(entity)}
    >
      {!isEdited && (
        <span className={styles.content}>
          <span>
            {entity.status === 'unsaved' && '*'}
            {entity.name}
          </span>
          {entity.type === EntityType.Query && (
            <Tippy
              placement="bottom"
              interactive
              trigger="click"
              onClickOutside={() => setMenuVisible(false)}
              render={() => isMenuVisible && (
                <div className={styles.menu}>
                  <a onClick={onEdit}>Edit</a>
                  <a onClick={handleDelete}>Delete</a>
                </div>
              )}
            >
              <a
                className={styles.menuTrigger}
                onClick={() => setMenuVisible(true)}
              >e</a>
            </Tippy>
          )}
        </span>
      )}

      {isEdited && (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleUpdate}
        />
      )}
    </div>
  );
}
