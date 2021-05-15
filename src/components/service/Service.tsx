import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { IState, loadSchemas, loadEntities } from '../../state';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import Table from './Table';
import styles from './Service.scss';

interface IContentProps {
  visible: boolean;
}

export default function Content(props: IContentProps) {
  const dispatch = useDispatch();

  const selectedSchema = useSelector((state: IState) => state.selectedSchema);
  const openEntities = useSelector((state: IState) => state.openEntities);
  const selectedEntity = useSelector((state: IState) => state.selectedEntity);

  useEffect(() => {
    dispatch(loadSchemas());
  }, []);

  useEffect(() => {
    if (selectedSchema) dispatch(loadEntities(selectedSchema));
  }, [selectedSchema]);

  return (
    <div className={classNames(styles.service, { hidden: !props.visible })}>
      <Sidebar />
      <div className={styles.content}>
        <Tabs />
        {openEntities.map(entity => (
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
