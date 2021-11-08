import { Dispatch, SetStateAction } from 'react';
import { Connection } from '../../app/types';
import { PostgreSQLAdapter } from '../adapter';
import { Schema } from './Schema';
import { Entity } from './Entity';
import { LoadingStatus } from './LoadingStatus';

export interface ServiceContextDescriptor {
  connection: Connection;
  adapter: PostgreSQLAdapter;
  schemas: Schema[];
  activeSchemaId: string | null;
  entities: Entity[];
  openEntityIds: string[];
  activeEntityId: string | null;
  dataLoadingStatus: LoadingStatus;
  setSchemas: Dispatch<SetStateAction<Schema[]>>;
  setActiveSchemaId: Dispatch<SetStateAction<string | null>>;
  setEntities: Dispatch<SetStateAction<Entity[]>>;
  setOpenEntityIds: Dispatch<SetStateAction<string[]>>;
  setActiveEntityId: Dispatch<SetStateAction<string | null>>;
  setDataLoadingStatus: Dispatch<SetStateAction<LoadingStatus>>;
  loadData(status?: LoadingStatus): void;
  openEntity(id: string): void;
  closeEntity(id: string): void;
}
