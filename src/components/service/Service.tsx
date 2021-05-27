import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { IState, loadSchemas, loadEntities, IEntity } from '../../state';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import Table from './Table';
import styles from './Service.scss';

interface IServiceProps {
  visible: boolean;
}

export default function Service(props: IServiceProps) {
  const dispatch = useDispatch();

  const selectedSchema = useSelector((state: IState) => state.selectedSchema);
  const openEntities = useSelector((state: IState) => state.openEntities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);
  const [orderedEntities, setOrderedEntities] = useState<IEntity[]>([]);

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

  return (
    <div className={classNames(styles.service, { hidden: !props.visible })}>
      <Sidebar />
      <div className={styles.content}>
        <Tabs />
        {orderedEntities.map(entity => (
          <Table
            key={entity.id}
            visible={entity === selectedEntity}
            entity={entity}
          />
        ))}
      </div>
    </div>
  );
}
