export enum ConnectionTypeEnum {
  PostgreSQL,
}

export interface IConnectionDetails {
  type: ConnectionTypeEnum;
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}
