import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useServiceContext } from '../../hooks';
import { Schema } from '../../types';
import styles from './SchemaSelectorDropdown.scss';
import { useFocus, useHotkey } from '../../../app/hooks';

interface Props {
  onClose(): void;
}

export function SchemaSelectorDropdown({ onClose }: Props) {
  const { schemas, activeSchema, setActiveSchema } = useServiceContext();

  const [isAllSchemasVisible, setAllSchemasVisible] = useState(false);
  const [focusedSchemaIndex, setFocusedSchemaIndex] = useState(-1);

  const filteredSchemas = schemas!.filter(e => {
    if (isAllSchemasVisible) {
      return true;
    } else {
      return !e.internal;
    }
  });

  const scope = 'SchemaSelectorDropdown';

  useFocus(scope, true);

  useHotkey(scope, 'esc', () => onClose());

  useHotkey(scope, 'down', () => {
    let idx = focusedSchemaIndex + 1;
    if (idx > filteredSchemas.length - 1) idx = -1;
    setFocusedSchemaIndex(idx);
  }, [filteredSchemas]);

  useHotkey(scope, 'up', () => {
    let idx = focusedSchemaIndex - 1;
    if (idx < -1) idx = filteredSchemas.length - 1;
    setFocusedSchemaIndex(idx);
  }, [filteredSchemas]);

  useHotkey(scope, 'enter', () => {
    const schema = filteredSchemas[focusedSchemaIndex];
    if (schema) {
      setActiveSchema(schema);
      onClose();
    }
  }, [focusedSchemaIndex]);

  useEffect(() => {
    if (activeSchema!.internal) setAllSchemasVisible(true);
  }, []);

  useEffect(() => {
    setFocusedSchemaIndex(-1);
  }, [isAllSchemasVisible]);

  function handleSelectSchema(ev: React.MouseEvent, schema: Schema) {
    ev.preventDefault();
    setActiveSchema(schema);
    onClose();
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
              { [styles.selected]: schema.id === activeSchema!.id },
              { [styles.focus]: idx === focusedSchemaIndex },
            )
          }
          onClick={(ev) => handleSelectSchema(ev, schema)}
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
