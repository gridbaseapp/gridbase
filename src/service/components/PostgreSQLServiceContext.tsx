import React, { useState } from 'react';
import { useAppContext, useDidUpdateEffect } from '../../app/hooks';
import { Service } from '../../app/types';
import { PostgreSQLAdapter } from '../adapter';
import { ServiceContext } from '../contexts';
import { Schema, Entity, EntityType, LoadingStatus, SqlQuery } from '../types';

interface Props {
  service: Service;
  children: React.ReactNode;
}

export function PostgreSQLServiceContext({ service, children }: Props) {
  const { connection } = service;

  const { stash } = useAppContext();

  const [adapter, setAdapter] = useState<PostgreSQLAdapter>(service.adapter);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [activeSchemaId, setActiveSchemaId] = useState<string | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [openEntityIds, setOpenEntityIds] = useState<string[]>([]);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState<LoadingStatus>('loading');
  const [isDisconnected, setDisconnected] = useState(false);

  useDidUpdateEffect(() => {
    if (activeSchemaId) {
      stash.set(`service-${connection.uuid}.defaultSchemaId`, activeSchemaId);
    }
  }, [activeSchemaId]);

  function openEntity(id: string) {
    if (!openEntityIds.includes(id)) {
      setOpenEntityIds(state => [...state, id]);
    }

    setActiveEntityId(id);
  }

  function closeEntity(id: string) {
    if (activeEntityId === id) {
      const idx = openEntityIds.indexOf(id);

      const [left, right] = [
        openEntityIds[idx - 1],
        openEntityIds[idx + 1],
      ];

      setActiveEntityId(right ?? left ?? null);
    }

    setOpenEntityIds(state => state.filter(e => e !== id));

    const entity = entities.find(e => e.id === id);

    if (entity?.status === 'new') {
      setEntities(state => state.filter(e => e.id !== id));
    } else if (entity?.status === 'unsaved') {
      setEntities(state => {
        const i = state.findIndex(e => e.id === entity.id);

        return [
          ...state.slice(0, i),
          { ...entity, status: 'fresh' },
          ...state.slice(i + 1),
        ];
      });
    }
  }

  async function loadData(status: LoadingStatus = 'loading') {
    setDataLoadingStatus(status);

    const defaultSchemaId = stash.get(`service-${connection.uuid}.defaultSchemaId`);
    const sqlQueries = stash.get(`service-${connection.uuid}.queries`, []) as SqlQuery[];

    const [schemas, entities] = await Promise.all([
      adapter.getSchemas(),
      adapter.getEntities(),
    ]);

    let activeSchema = schemas.find(e => e.id === defaultSchemaId);
    if (!activeSchema) activeSchema = schemas.find(e => e.name === 'public');
    if (!activeSchema) activeSchema = schemas.filter(e => !e.internal)[0];
    if (!activeSchema) activeSchema = schemas[0];

    sqlQueries.forEach(e => {
      entities.push({
        id: e.id,
        name: e.name,
        type: EntityType.Query,
        schemaId: e.schemaId,
        status: 'fresh',
      });
    });

    setSchemas(schemas);
    setEntities(state => {
      const newState: Entity[] = [];

      entities.forEach(entity => {
        newState.push(entity);
      });

      state.forEach(entity => {
        if (!newState.find(e => e.id === entity.id)) {
          newState.push(entity);
        }
      });

      return newState;
    });
    setActiveSchemaId(activeSchema.id);

    setDataLoadingStatus('success');
  }

  const contextValue = {
    adapter,
    connection,
    schemas,
    activeSchemaId,
    entities,
    openEntityIds,
    activeEntityId,
    dataLoadingStatus,
    isDisconnected,
    setAdapter,
    setSchemas,
    setActiveSchemaId,
    setEntities,
    setOpenEntityIds,
    setActiveEntityId,
    setDataLoadingStatus,
    setDisconnected,
    loadData,
    openEntity,
    closeEntity,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
}
