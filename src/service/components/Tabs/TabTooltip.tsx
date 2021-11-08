import React from 'react';
import { useServiceContext } from '../../hooks';
import { Entity } from '../../types';
import styles from './TabTooltip.scss';

interface Props {
  entity: Entity;
}

export function TabTooltip({ entity }: Props) {
  const { schemas } = useServiceContext();
  const schema = schemas.find(e => e.id === entity.schemaId)!;

  return (
    <div className={styles.tooltip}>
      [{schema.name}] [{entity.type}] {entity.name}
    </div>
  );
}
