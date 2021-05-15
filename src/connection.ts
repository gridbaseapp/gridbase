export enum ServiceType {
  PostgreSQL,
}

export interface IConnection {
  uuid: string;
  type: ServiceType;
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}
