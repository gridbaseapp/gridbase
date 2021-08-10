import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import styles from './SidebarEntities.scss';
import { EntityType, IEntity, IState, openEntity } from '../../state';
import hotkeys from '../../utils/hotkeys';

interface ISidebarEntitiesProps {
  entityTypes: EntityType[];
  visible: boolean;
  hasFocus: boolean;
}

export default function SidebarEntities(props: ISidebarEntitiesProps) {
  const dispatch = useDispatch();

  const connectionUUID = useSelector((state: IState) => state.adapter.connection.uuid);
  const entities = useSelector((state: IState) => state.entities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);

  const [filter, setFilter] = useState('');
  const [activeEntity, setActiveEntity] = useState<IEntity|null>(null);

  const filterElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const context = `service.${connectionUUID}.SidebarEntities.${props.entityTypes.join('.')}`;

    if (props.visible && props.hasFocus) {
      hotkeys.bind(context, {
        'mod+f': () => {
          filterElement.current?.focus();
        },
        'esc': () => {
          filterElement.current?.blur();

          if (filter != '') {
            setFilter('');
            setActiveEntity(null);
          }
        },
        'up': () => {
          const rows = filteredEntities();

          if (rows.length === 0) return;
          if (!activeEntity) {
            setActiveEntity(rows[rows.length - 1]);
            return;
          }

          let idx = rows.indexOf(activeEntity);
          idx -= 1;
          setActiveEntity(rows[idx]);
        },
        'down': () => {
          const rows = filteredEntities();

          if (rows.length === 0) return;
          if (!activeEntity) {
            setActiveEntity(rows[0]);
            return;
          }

          let idx = rows.indexOf(activeEntity);
          idx += 1;
          setActiveEntity(rows[idx]);
        },
        'enter': () => {
          if (activeEntity) dispatch(openEntity(activeEntity));
        },
      });
    } else {
      hotkeys.unbind(context);
    }

    return () => hotkeys.unbind(context);
  }, [props.visible, props.hasFocus, entities, activeEntity, selectedEntity, filter]);

  function onClickEntity(ev: React.MouseEvent, entity: IEntity) {
    ev.preventDefault();
    setActiveEntity(entity);
  }

  function onOpenEntity(ev: React.MouseEvent, entity: IEntity) {
    ev.preventDefault();
    dispatch(openEntity(entity));
  }

  function onFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function filteredEntities() {
    let rows = entities.filter((e: IEntity) => props.entityTypes.includes(e.type));
    if (filter.length === 0) return rows;
    return rows.filter((e: IEntity) => e.name.includes(filter));
  }

  return (
    <div
      className={
        classNames(
          styles.sidebarEntities,
          {
            hidden: !props.visible,
            [styles.hasFocus]: props.hasFocus
          },
        )
      }
    >
      <div className={styles.list}>
        {filteredEntities().map(entity => <a
          href=""
          className={
            classNames({
              [styles.selected]: entity.id === selectedEntity?.id,
              [styles.active]: entity.id === activeEntity?.id,
            })
          }
          key={entity.id}
          onClick={(ev) => onClickEntity(ev, entity)}
          onDoubleClick={(ev) => onOpenEntity(ev, entity)}
        >
          {entity.name}
        </a>)}
      </div>

      <div>
        <input
          ref={filterElement}
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
