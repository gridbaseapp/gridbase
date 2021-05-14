import React, { useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import styles from './SidebarEntities.scss';
import { EntityType, IEntity, IState, openEntity } from '../state';

interface ISidebarEntitiesProps {
  entityTypes: EntityType[];
}

export default function SidebarEntities({ entityTypes }: ISidebarEntitiesProps) {
  const dispatch = useDispatch();

  const entities = useSelector((state: IState) => state.entities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);

  const [filter, setFilter] = useState('');

  function onOpenEntity(ev: React.MouseEvent, entity: IEntity) {
    ev.preventDefault();
    dispatch(openEntity(entity));
  }

  function onFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function filteredEntities() {
    let rows = entities.filter((e: IEntity) => entityTypes.includes(e.type));
    if (filter.length === 0) return rows;
    return rows.filter((e: IEntity) => e.name.includes(filter));
  }

  return (
    <div className={styles.sidebarEntities}>
      <div className={styles.list}>
        {filteredEntities().map(entity => <a
          href=""
          className={classNames({ [styles.selected]: entity.id === selectedEntity?.id})}
          key={entity.id}
          onClick={(ev) => ev.preventDefault()}
          onDoubleClick={(ev) => onOpenEntity(ev, entity)}
        >
          {entity.name}
        </a>)}
      </div>

      <div>
        <input
          className={styles.filter}
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={onFilter}
        />
      </div>
    </div>
  );
}
