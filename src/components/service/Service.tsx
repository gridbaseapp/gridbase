import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { IState, loadSchemas } from '../store';
import Sidebar from './Sidebar';
// import Tabs from './Tabs';
// import Table from './Table';
import styles from './Service.scss';

interface IContentProps {
  className: string;
}

export default function Content(props: IContentProps) {
  const dispatch = useDispatch();

  // const [openEntities, setOpenEntities] = useState<string[]>([]);
  // const [selectedEntity, setSelectedEntity] = useState<string>();

  useEffect(() => {
    dispatch(loadSchemas());
  }, []);

  // function onOpenEntity(entity: string) {
  //   if (!openEntities.includes(entity)) {
  //     setOpenEntities([...openEntities, entity]);
  //   }
  //   setSelectedEntity(entity);
  // }

  // function onCloseEntity(entity: string) {
  //   const entities = openEntities.filter(e => e !== entity);
  //   setOpenEntities(entities);

  //   if (selectedEntity === entity) {
  //     setSelectedEntity(entity.length > 0 ? entities[entities.length - 1] : undefined);
  //   }
  // }

  return (
    <div className={classNames(styles.service, props.className)}>
      <Sidebar
        // selectedEntity={selectedEntity}
        // onOpenEntity={onOpenEntity}
      />
      {/* <div className={styles.content}>
        <Tabs
          entities={openEntities}
          selectedEntity={selectedEntity}
          onSelectEntity={(entity) => setSelectedEntity(entity)}
          onCloseEntity={onCloseEntity}
        />
        {openEntities.map(entity => (
          <Table
            key={entity}
            className={classNames({ [styles.hidden]: entity !== selectedEntity })}
            schema={selectedSchema}
            table={entity}
          />
        ))}
      </div> */}
    </div>
  );
}
