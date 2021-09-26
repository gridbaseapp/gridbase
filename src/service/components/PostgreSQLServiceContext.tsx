import React, { useState } from 'react';
import { Service } from '../../app/types';
import { ServiceContext } from '../contexts';
import { Schema, Entity, EntitiesStatus } from '../types';

interface Props {
  service: Service;
  children: React.ReactNode;
}

export function PostgreSQLServiceContext({ service, children }: Props) {
  const [schemas, setSchemas] = useState<Schema[]>();
  const [activeSchema, setActiveSchema] = useState<Schema>();
  const [entities, setEntities] = useState<Entity[]>();
  const [openEntities, setOpenEntities] = useState<Entity[]>([]);
  const [activeEntity, setActiveEntity] = useState<Entity>();
  const [entitiesStatus, setEntitiesStatus] = useState<EntitiesStatus>('success');

  function openEntity(entity: Entity) {
    if (!openEntities.map(e => e.id).includes(entity.id)) {
      setOpenEntities(state => [...state, entity]);
    }

    setActiveEntity(entity);
  }

  function closeEntity(entity: Entity) {
    if (activeEntity?.id === entity.id) {
      const idx = openEntities.map(e => e.id).indexOf(entity.id);

      let newActiveEntity = openEntities[idx + 1];
      if (!newActiveEntity) newActiveEntity = openEntities[idx - 1];

      setActiveEntity(newActiveEntity);
    }

    setOpenEntities(state => state.filter(e => e.id !== entity.id));
  }

  const contextValue = {
    ...service,
    schemas,
    activeSchema,
    entities,
    entitiesStatus,
    openEntities,
    activeEntity,
    setSchemas,
    setActiveSchema,
    setEntities,
    setEntitiesStatus,
    setOpenEntities,
    setActiveEntity,
    openEntity,
    closeEntity,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
}
