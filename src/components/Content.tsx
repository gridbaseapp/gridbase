import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import Table from './Table';
import styles from './Content.scss';

interface IContentProps {
  className: string;
  localStore: LocalStore;
  connection: IConnection;
}

export default function Content(props: IContentProps) {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState('public');
  const [openEntities, setOpenEntities] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>();

  useEffect(() => {
    async function run() {
      const savedSchema = props
        .localStore
        .getSchema(props.connection.connectionDetails.uuid);

      const { rows } = await props.connection.client.query(`
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
    props.localStore.setSchema(props.connection.connectionDetails.uuid, schema);
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

  function onReorderEntities(entity: string[]) {
    setOpenEntities(entity);
  }

  return (
    <div className={classNames(styles.content, props.className)}>
      <Sidebar
        connection={props.connection}
        schemas={schemas}
        selectedSchema={selectedSchema}
        selectedEntity={selectedEntity}
        onSelectSchema={onSelectSchema}
        onOpenEntity={onOpenEntity}
      />
      <div className={styles.tabsContent}>
        <Tabs
          entities={openEntities}
          selectedEntity={selectedEntity}
          onSelectEntity={(entity) => setSelectedEntity(entity)}
          onCloseEntity={onCloseEntity}
          onReorderEntities={onReorderEntities}
        />
        {openEntities.sort().map(entity => (
          <Table
            key={entity}
            className={classNames({ [styles.hidden]: entity !== selectedEntity })}
            connection={props.connection}
            schema={selectedSchema}
            table={entity}
          />
        ))}
      </div>
    </div>
  );
}
