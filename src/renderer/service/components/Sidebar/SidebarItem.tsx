import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react/headless';
import { Entity, EntityType, SqlQuery } from '../../types';
import { useExclusiveFocus, useHotkey } from '../../../app/hooks';
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
  onCancel(): void;
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
  onCancel,
  onUpdate,
  onDelete,
}: Props) {
  const { adapter, connection, schemas } = useServiceContext();

  const schema = schemas.find(e => e.id === entity.schemaId)!;

  const [
    loadSqlQueries,
    saveSqlQueries,
  ] = useServiceStash<SqlQuery[]>(`queries`, []);

  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(entity.name);
  const [isMenuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    isEdited && inputRef.current?.focus();
    setValue(entity.name);
  }, [isEdited]);

  const name = `SidebarItem-${connection.uuid}-${entity.id}`;

  useExclusiveFocus(name, isEdited);

  useHotkey(name, 'meta+s, enter', () => {
    handleUpdate();
  }, [value]);

  useHotkey(name, 'escape', () => {
    onCancel();
  }, []);

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    setValue(ev.target.value);
  }

  function handleUpdate() {
    if (entity.type === EntityType.Table) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`ALTER TABLE ${name} RENAME TO ${value}`);
    } else if (entity.type === EntityType.View) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`ALTER VIEW ${name} RENAME TO ${value}`);
    } else if (entity.type === EntityType.MaterializedView) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`ALTER MATERIALIZED VIEW ${name} RENAME TO ${value}`);
    } else if (entity.type === EntityType.Query) {
      const queries = loadSqlQueries();
      const idx = queries.findIndex(e => e.id === entity.id);

      if (idx > -1) {
        queries[idx].name = value;
        saveSqlQueries(queries);
      }
    }

    onUpdate({ ...entity, name: value });
  }

  function handleRefresh() {
    if (entity.type === EntityType.MaterializedView) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`REFRESH MATERIALIZED VIEW ${name}`);
    }

    setMenuVisible(false);
  }

  function handleDelete() {
    if (entity.type === EntityType.Table) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`DROP TABLE ${name}`);
    } else if (entity.type === EntityType.View) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`DROP VIEW ${name}`);
    } else if (entity.type === EntityType.MaterializedView) {
      const name = `"${schema.name}"."${entity.name}"`;
      adapter.query(`DROP MATERIALIZED VIEW ${name}`);
    } else if (entity.type === EntityType.Query) {
      const queries = loadSqlQueries();
      saveSqlQueries(queries.filter(e => e.id !== entity.id));
    }

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
            {!entity.canSelect && '(locked)'}
            {entity.name}
          </span>
          <Tippy
            placement="bottom"
            interactive
            trigger="click"
            onClickOutside={() => setMenuVisible(false)}
            render={() => isMenuVisible && (
              <div className={styles.menu}>
                <a onClick={onEdit}>Edit</a>
                {entity.type === EntityType.MaterializedView && (
                  <a onClick={handleRefresh}>Refresh</a>
                )}
                <a onClick={handleDelete}>Delete</a>
              </div>
            )}
          >
            <a
              className={styles.menuTrigger}
              onClick={() => setMenuVisible(true)}
            >e</a>
          </Tippy>
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
