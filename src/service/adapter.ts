import { Client } from 'pg';
import { Connection } from '../app/types';
import { Schema, EntityType, Entity } from './types';

// interface IAttribute {
//   name: string;
// }

const SQL_GET_SCHEMAS = `
  SELECT
    "oid" AS "id",
    "nspname" AS "name",
    NOT ("nspname" !~ '^pg_' AND "nspname" <> 'information_schema') AS "internal"
  FROM "pg_catalog"."pg_namespace"
  ORDER BY "nspname";
`;

const SQL_GET_ENTITIES = `
  SELECT
    "oid" AS "id",
    "relname" AS "name",
    CASE "relkind"
      WHEN 'r' THEN ${EntityType.Table}
      WHEN 'v' THEN ${EntityType.View}
      WHEN 'm' THEN ${EntityType.MaterializedView}
    END AS "type"
  FROM "pg_catalog"."pg_class"
  WHERE
    "relnamespace" = ':SCHEMA_ID:'
  AND "relkind" IN ('r', 'v', 'm')
  ORDER BY "relname";
`;

const SQL_GET_ATTRIBUTES = `
  SELECT
    "attname" AS "name"
  FROM "pg_catalog"."pg_attribute"
  WHERE
    "attrelid" = ':RELATION_ID:'
    AND "attnum" > 0
    AND NOT "attisdropped"
  ORDER BY "attnum"
`;

export class PostgreSQLAdapter {
  private readonly client: Client;

  constructor(connection: Connection) {
    this.client = new Client(connection);
  }

  connect() {
    return this.client.connect();
  }

  disconnect() {
    return this.client.end();
  }

  async getSchemas() {
    // await new Promise(r => setTimeout(() => r(null), 250));//TODO
    return (await this.client.query<Schema>(SQL_GET_SCHEMAS)).rows;
  }

  async getEntities(schemaId: string) {
    // await new Promise(r => setTimeout(() => r(null), 250));//TODO
    const sql = SQL_GET_ENTITIES.replace(':SCHEMA_ID:', schemaId);
    return (await this.client.query<Entity>(sql)).rows;
  }

  async getAttributes(relationId: string) {
    // await new Promise(r => setTimeout(() => r(null), 250));//TODO
    const sql = SQL_GET_ATTRIBUTES.replace(':RELATION_ID:', relationId);
    const rows = (await this.client.query<{ name: string }>(sql)).rows;
    return rows.map(e => e.name);
  }

  async query(sql: string) {
    // await new Promise(r => setTimeout(() => r(null), 250));//TODO
    return this.client.query(sql);
  }
}
