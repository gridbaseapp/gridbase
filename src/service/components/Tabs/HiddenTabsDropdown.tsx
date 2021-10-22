import React from 'react';
import classNames from 'classnames';
import { Entity } from '../../types';
import styles from './HiddenTabsDropdown.scss';
import { useServiceContext } from '../../hooks';

interface Props {
  entities: Entity[];
  onActivateEntity(entity: Entity): void;
}

export function HiddenTabsDropdown({ entities, onActivateEntity }: Props) {
  const { activeEntity } = useServiceContext();

  function handleClick(ev: React.MouseEvent, entity: Entity) {
    ev.preventDefault();
    onActivateEntity(entity);
  }

  return (
    <div className={styles.hiddenTabsDropdown}>
      {entities.map(entity => (
        <a
          key={entity.id}
          className={classNames({ [styles.active]: entity.id === activeEntity?.id })}
          onClick={(ev) => handleClick(ev, entity)}
        >
          {entity.name}
        </a>)
      )}
    </div>
  );
}
