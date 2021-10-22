import { Dispatch, SetStateAction } from 'react';
import { Connection } from '../../app/types';
import { PostgreSQLAdapter } from '../adapter';
import { Schema } from './Schema';
import { Entity } from './Entity';
import { EntitiesStatus } from './EntitiesStatus';

export interface ServiceContextDescriptor {
  connection: Connection;
  adapter: PostgreSQLAdapter;
  schemas?: Schema[];
  activeSchema?: Schema;
  entities?: Entity[];
  entitiesStatus: EntitiesStatus;
  openEntities: Entity[];
  activeEntity?: Entity;
  setSchemas: Dispatch<SetStateAction<Schema[] | undefined>>;
  setActiveSchema: Dispatch<SetStateAction<Schema | undefined>>;
  setEntities: Dispatch<SetStateAction<Entity[] | undefined>>;
  setEntitiesStatus: Dispatch<SetStateAction<EntitiesStatus>>;
  setOpenEntities: Dispatch<SetStateAction<Entity[]>>;
  setActiveEntity: Dispatch<SetStateAction<Entity | undefined>>;
  openEntity(entity: Entity): void;
  closeEntity(entity: Entity): void;
}
