import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState, IEntity, openEntity } from '../state';
import styles from './GoTo.scss';

interface IGoToProps {
  onEntityClicked(): void;
}

export default function GoTo({ onEntityClicked }: IGoToProps) {
  const dispatch = useDispatch();
  const entities = useSelector((state: IState) => state.entities);

  const filterRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (filterRef.current) filterRef.current.focus();
  }, []);

  function onFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function onClickEntity(ev: React.MouseEvent, entity: IEntity) {
    ev.preventDefault();
    dispatch(openEntity(entity));
    onEntityClicked();
  }

  function filteredEntities() {
    if (filter.length === 0) return entities;
    return entities.filter((e: IEntity) => e.name.includes(filter));
  }

  return (
    <div className={styles.goTo}>
      <input
        ref={filterRef}
        className={styles.filter}
        type="text"
        value={filter}
        onChange={onFilter}
      />

      <div className={styles.list}>
        {filteredEntities().map(entity => (
          <a
            href=""
            key={entity.id}
            onClick={(ev) => onClickEntity(ev, entity)}
          >
            {entity.type}: {entity.name}
          </a>
        ))}
      </div>
    </div>
  );
}
