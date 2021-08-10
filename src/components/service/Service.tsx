import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { IState, loadSchemas, loadEntities, IEntity } from '../../state';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import Table from './Table';
import styles from './Service.scss';
import hotkeys from '../../utils/hotkeys';

interface IServiceProps {
  visible: boolean;
}

export default function Service(props: IServiceProps) {
  const dispatch = useDispatch();

  const connectionUUID = useSelector((state: IState) => state.adapter.connection.uuid);

  const selectedSchema = useSelector((state: IState) => state.selectedSchema);
  const openEntities = useSelector((state: IState) => state.openEntities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);
  const [orderedEntities, setOrderedEntities] = useState<IEntity[]>([]);

  const [focusElement, setFocusElement] = useState('Sidebar');

  useEffect(() => {
    dispatch(loadSchemas());
  }, []);

  useEffect(() => {
    if (selectedSchema) dispatch(loadEntities(selectedSchema));
  }, [selectedSchema]);

  useEffect(() => {
    const entities = orderedEntities.filter(e => openEntities.includes(e));

    openEntities.forEach(e => {
      if (!orderedEntities.includes(e)) entities.push(e);
    });

    setOrderedEntities(entities);
  }, [openEntities]);

  useEffect(() => {
    const contexts = hotkeys.getContexts();
    const thisContexts = contexts.filter(e => e.startsWith(`service.${connectionUUID}`));

    if (props.visible) {
      hotkeys.unpause(thisContexts);
    } else {
      hotkeys.pause(thisContexts);
    }
  }, [props.visible]);

  return (
    <div className={classNames(styles.service, { hidden: !props.visible })}>
      <Sidebar
        hasFocus={focusElement === 'Sidebar'}
        onFocus={() => setFocusElement('Sidebar')}
      />

      <div className={styles.content} onClick={() => setFocusElement('Table')}>
        <Tabs />
        {orderedEntities.map(entity => (
          <Table
            key={entity.id}
            visible={entity === selectedEntity}
            hasFocus={focusElement === 'Table'}
            entity={entity}
          />
        ))}
      </div>
    </div>
  );
}
