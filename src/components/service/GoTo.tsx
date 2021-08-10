import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState, IEntity, ENTITY_TYPE_HUMAN, openEntity } from '../../state';
import hotkeys from '../../utils/hotkeys';
import styles from './GoTo.scss';

interface IGoToProps {
  onEntityClicked(): void;
}

export default function GoTo({ onEntityClicked }: IGoToProps) {
  const dispatch = useDispatch();

  const connectionUUID = useSelector((state: IState) => state.adapter.connection.uuid);
  const entities = useSelector((state: IState) => state.entities);

  const filterRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState('');

  const [activeEntity, setActiveEntity] = useState<IEntity>(entities[0]);

  useEffect(() => {
    if (filterRef.current) filterRef.current.focus();
  }, []);

  useEffect(() => {
    const context = `service.${connectionUUID}.GoTo`;
    const activeContexts = hotkeys.getContexts();

    hotkeys.pause(activeContexts);
    hotkeys.bind(context, {
      'esc': () => {
        onEntityClicked();
      },
      'up': () => {
        if (entities.length === 0) return;

        let idx = entities.indexOf(activeEntity);
        idx -= 1;
        if (idx === -1) idx = entities.length - 1;
        setActiveEntity(entities[idx]);
      },
      'down': () => {
        if (entities.length === 0) return;

        let idx = entities.indexOf(activeEntity);
        idx += 1;
        if (idx >= entities.length) idx = 0;
        setActiveEntity(entities[idx]);
      },
      'enter': () => {
        if (activeEntity) {
          dispatch(openEntity(activeEntity));
          onEntityClicked();
        }
      },
    });

    return () => {
      hotkeys.unbind(context);
      hotkeys.unpause(activeContexts);
    };
  }, [entities, activeEntity]);

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
            className={classNames({ [styles.active]: entity === activeEntity })}
            onClick={(ev) => onClickEntity(ev, entity)}
          >
            [{entity.schema?.name}] [{ENTITY_TYPE_HUMAN[entity.type]}] {entity.name}
          </a>
        ))}
      </div>
    </div>
  );
}
