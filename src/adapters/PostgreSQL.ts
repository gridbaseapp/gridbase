import { Client } from 'pg';
import { IConnection } from '../connection';
import { EntityType } from '../state';

const SQL_GET_SCHEMAS = `
  SELECT oid AS id, nspname AS name
  FROM pg_catalog.pg_namespace
  WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'
  ORDER BY nspname;
`;

const SQL_GET_ENTITIES = `
  SELECT oid AS id, relname AS name,
    CASE relkind
      WHEN 'r' THEN ${EntityType.Table}
      WHEN 'v' THEN ${EntityType.View}
      WHEN 'm' THEN ${EntityType.MaterializeView}
    END AS type
  FROM pg_catalog.pg_class
  WHERE
    relnamespace = ':SCHEMA_ID:'
    AND relkind IN ('r', 'v', 'm')
  ORDER BY relname;
`;

export class PostgreSQL {
  connection: IConnection;
  client: Client;

  constructor(connection: IConnection) {
    this.connection = connection;
    this.client = new Client(connection);
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.end();
  }

  async getSchemas() {
    return (await this.client.query(SQL_GET_SCHEMAS)).rows;
  }

  async getEntities(schemaId: string) {
    const sql = SQL_GET_ENTITIES.replace(':SCHEMA_ID:', schemaId);
    return (await this.client.query(sql)).rows;
  }
}
