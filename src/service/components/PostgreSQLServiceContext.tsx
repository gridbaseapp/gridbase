import React, { useEffect, useState } from 'react';
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
  const [openEntities, setOpenEntities] = useState<Entity[]>([]);
  const [activeEntityId, setActiveEntityId] = useState<string>();
  const [entitiesStatus, setEntitiesStatus] = useState<EntitiesStatus>('success');

  useEffect(() => {
    setEntities(state => {
      if (!state) return;

      const newState: Entity[] = [];

      state.forEach(entity => {
        const foundEntity = openEntities.find(e => e.id === entity.id);
        newState.push(foundEntity ?? entity);
      });

      openEntities.forEach(entity => {
        if (entity.status === 'new') return;

        if (!state.map(e => e.id).includes(entity.id) ) {
          newState.push(entity);
        }
      })

      return newState;
    });
  }, [openEntities]);

  function openEntity(entity: Entity) {
    if (!openEntities.map(e => e.id).includes(entity.id)) {
      setOpenEntities(state => [...state, entity]);
    }

    setActiveEntityId(entity.id);
  }

  function closeEntity(id: string) {
    if (activeEntityId === id) {
      const idx = openEntities.map(e => e.id).indexOf(id);

      let newActiveEntity = openEntities[idx + 1];
      if (!newActiveEntity) newActiveEntity = openEntities[idx - 1];

      setActiveEntityId(newActiveEntity?.id);
    }

    setOpenEntities(state => state.filter(e => e.id !== id));

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
    openEntities,
    activeEntityId,
    setSchemas,
    setActiveSchemaId,
    setEntities,
    setEntitiesStatus,
    setOpenEntities,
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
