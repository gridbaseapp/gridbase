import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useServiceContext } from '../../hooks';
import { Schema } from '../../types';
import styles from './SchemaSelectorDropdown.scss';
import { useExclusiveFocus, useHotkey } from '../../../app/hooks';

interface Props {
  onClose(): void;
}

export function SchemaSelectorDropdown({ onClose }: Props) {
  const {
    schemas,
    activeSchemaId,
    setActiveSchemaId,
    loadData,
  } = useServiceContext();

  const [isAllSchemasVisible, setAllSchemasVisible] = useState(false);
  const [focusedSchemaIndex, setFocusedSchemaIndex] = useState(-1);

  const filteredSchemas = schemas.filter(e => {
    if (isAllSchemasVisible) {
      return true;
    } else {
      return !e.internal;
    }
  });

  const scope = 'SchemaSelectorDropdown';

  useExclusiveFocus(scope, true);

  useHotkey(scope, 'escape', () => onClose());

  useHotkey(scope, 'arrowdown', () => {
    let idx = focusedSchemaIndex + 1;
    if (idx > filteredSchemas.length - 1) idx = -1;
    setFocusedSchemaIndex(idx);
  }, [filteredSchemas]);

  useHotkey(scope, 'arrowup', () => {
    let idx = focusedSchemaIndex - 1;
    if (idx < -1) idx = filteredSchemas.length - 1;
    setFocusedSchemaIndex(idx);
  }, [filteredSchemas]);

  useHotkey(scope, 'enter', () => {
    const schema = filteredSchemas[focusedSchemaIndex];
    if (schema) handleSelectSchema(schema);
  }, [focusedSchemaIndex]);

  useEffect(() => {
    const activeSchema = schemas.find(e => e.id === activeSchemaId);
    if (activeSchema?.internal) setAllSchemasVisible(true);
  }, []);

  useEffect(() => {
    setFocusedSchemaIndex(-1);
  }, [isAllSchemasVisible]);

  function handleSelectSchema(schema: Schema) {
    setActiveSchemaId(schema.id);
    onClose();
    setTimeout(() => {
      loadData('reloading');
    }, 0);
  }

  function handleExpandSchemas(ev: React.MouseEvent) {
    ev.preventDefault();
    setAllSchemasVisible(state => !state);
  }

  return (
    <div className={styles.schemaSelectorDropdown}>
      {filteredSchemas.map((schema, idx) => (
        <a
          key={schema.id}
          className={
            classNames(
              styles.schema,
              { [styles.selected]: schema.id === activeSchemaId },
              { [styles.focus]: idx === focusedSchemaIndex },
            )
          }
          onClick={() => handleSelectSchema(schema)}
        >{schema.name}</a>
      ))}

      {!isAllSchemasVisible &&
        <a onClick={handleExpandSchemas} className={styles.expandSchemas}>
          Show all schemas
        </a>
      }
      {isAllSchemasVisible &&
        <a onClick={handleExpandSchemas} className={styles.expandSchemas}>
          Hide internal schemas
        </a>
      }
    </div>
  );
}
