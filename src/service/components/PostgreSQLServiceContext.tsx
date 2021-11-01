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
  const [activeSchemaId, setActiveSchemaId] = useState<string>();
  const [entities, setEntities] = useState<Entity[]>();
  const [openEntityIds, setOpenEntityIds] = useState<string[]>([]);
  const [activeEntityId, setActiveEntityId] = useState<string>();
  const [entitiesStatus, setEntitiesStatus] = useState<EntitiesStatus>('success');

  function openEntity(id: string) {
    if (!openEntityIds.includes(id)) {
      setOpenEntityIds(state => [...state, id]);
    }

    setActiveEntityId(id);
  }

  function closeEntity(id: string) {
    if (activeEntityId === id) {
      const idx = openEntityIds.indexOf(id);

      let newActiveEntityId = openEntityIds[idx + 1];
      if (!newActiveEntityId) newActiveEntityId = openEntityIds[idx - 1];

      setActiveEntityId(newActiveEntityId);
    }

    setOpenEntityIds(state => state.filter(e => e !== id));

    const entity = entities?.find(e => e.id === id);

    if (entity) {
      if (entity.status === 'new') {
        setEntities(state => state?.filter(e => e.id !== id));
      } else if (entity.status === 'unsaved') {
        setEntities(state => {
          if (!state) return;

          const i = state.findIndex(e => e.id === entity.id);

          return [
            ...state.slice(0, i),
            { ...entity, status: 'fresh' },
            ...state.slice(i + 1),
          ];
        });
      }
    }
  }

  const contextValue = {
    ...service,
    schemas,
    activeSchemaId,
    entities,
    entitiesStatus,
    openEntityIds,
    activeEntityId,
    setSchemas,
    setActiveSchemaId,
    setEntities,
    setEntitiesStatus,
    setOpenEntityIds,
    setActiveEntityId,
    openEntity,
    closeEntity,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
}
