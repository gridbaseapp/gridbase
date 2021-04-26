import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { IState } from '../store';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import Table from './Table';
import styles from './Service.scss';

interface IContentProps {
  className: string;
}

export default function Content(props: IContentProps) {
  const localStore = useSelector((state: IState) => state.localStore);
  const connection = useSelector((state: IState) => state.connection);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState('public');
  const [openEntities, setOpenEntities] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>();

  useEffect(() => {
    async function run() {
      const savedSchema = localStore.getSchema(connection.connectionDetails.uuid);

      const { rows } = await connection.client.query(`
        SELECT n.nspname AS name
        FROM pg_catalog.pg_namespace n
        WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
        ORDER BY name;
      `);

      const schemas = rows.map(e => e.name);
      setSchemas(schemas);

      if (savedSchema && schemas.includes(savedSchema)) {
        setSelectedSchema(savedSchema);
      } else if (schemas.includes('public')) {
        setSelectedSchema('public');
      } else {
        setSelectedSchema(schemas[0]);
      }
    };

    run();
  }, []);

  function onSelectSchema(schema: string) {
    localStore.setSchema(connection.connectionDetails.uuid, schema);
    setSelectedSchema(schema);
  }

  function onOpenEntity(entity: string) {
    if (!openEntities.includes(entity)) {
      setOpenEntities([...openEntities, entity]);
    }
    setSelectedEntity(entity);
  }

  function onCloseEntity(entity: string) {
    const entities = openEntities.filter(e => e !== entity);
    setOpenEntities(entities);

    if (selectedEntity === entity) {
      setSelectedEntity(entity.length > 0 ? entities[entities.length - 1] : undefined);
    }
  }

  return (
    <div className={classNames(styles.service, props.className)}>
      <Sidebar
        schemas={schemas}
        selectedSchema={selectedSchema}
        selectedEntity={selectedEntity}
        onSelectSchema={onSelectSchema}
        onOpenEntity={onOpenEntity}
      />
      <div className={styles.content}>
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
      </div>
    </div>
  );
}
