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
  activeSchemaId?: string;
  entities?: Entity[];
  entitiesStatus: EntitiesStatus;
  openEntities: Entity[];
  activeEntityId?: string;
  setSchemas: Dispatch<SetStateAction<Schema[] | undefined>>;
  setActiveSchemaId: Dispatch<SetStateAction<string | undefined>>;
  setEntities: Dispatch<SetStateAction<Entity[] | undefined>>;
  setEntitiesStatus: Dispatch<SetStateAction<EntitiesStatus>>;
  setOpenEntities: Dispatch<SetStateAction<Entity[]>>;
  setActiveEntityId: Dispatch<SetStateAction<string | undefined>>;
  openEntity(entity: Entity): void;
  closeEntity(id: string): void;
}
