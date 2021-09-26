import React from 'react';
import { Entity } from '../../types';
import styles from './TabTooltip.scss';

interface Props {
  entity: Entity;
}

export function TabTooltip({ entity }: Props) {
  return (
    <div className={styles.tooltip}>
      [{entity.schema.name}] [{entity.type}] {entity.name}
    </div>
  );
}
