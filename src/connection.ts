import { Client } from 'pg';

export enum ConnectionTypeEnum {
  PostgreSQL,
}

export interface IConnectionDetails {
  uuid: string;
  type: ConnectionTypeEnum;
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface IConnection {
  connectionDetails: IConnectionDetails;
  client: Client;
}
