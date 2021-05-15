import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { IState, loadSchemas, loadEntities } from '../../state';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
// import Table from './Table';
import styles from './Service.scss';

interface IContentProps {
  className: string;
}

export default function Content(props: IContentProps) {
  const dispatch = useDispatch();
  const selectedSchema = useSelector((state: IState) => state.selectedSchema);

  useEffect(() => {
    dispatch(loadSchemas());
  }, []);

  useEffect(() => {
    if (selectedSchema) dispatch(loadEntities(selectedSchema));
  }, [selectedSchema]);

  return (
    <div className={classNames(styles.service, props.className)}>
      <Sidebar />
      <div className={styles.content}>
        <Tabs />
        {/* {openEntities.map(entity => (
          <Table
            key={entity}
            className={classNames({ [styles.hidden]: entity !== selectedEntity })}
            schema={selectedSchema}
            table={entity}
          />
        ))} */}
      </div>
    </div>
  );
}
