import { Dispatch, SetStateAction } from "react";
import { Connection } from "../app/types";
import { PostgreSQLAdapter } from "./adapter";

export interface Schema {
  id: string;
  name: string;
  internal: boolean;
}

export enum EntityType {
  Table,
  View,
  MaterializedView,
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  schema: Schema;
}

export type EntitiesStatus = 'success' | 'loading';

export type SortOrder = 'none' | 'asc' | 'desc';

interface Sort {
  position: number;
  order: SortOrder;
}

export interface Column {
  name: string;
  isVisible: boolean;
  width: number;
  sort: Sort;
}

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

export interface GridContextDescriptor {
  columns: Column[];
  onResizeColumn(column: Column, width: number): void;
  onReorderColumn(column: Column, order: SortOrder): void;
  onSortColumns(columns: Column[]): void;
}
