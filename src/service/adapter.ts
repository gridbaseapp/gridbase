import { Client } from 'pg';
import { Connection } from '../app/types';
import { Schema, EntityType, Entity } from './types';

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
    "relnamespace" = $1
  AND "relkind" IN ('r', 'v', 'm')
  ORDER BY "relname";
`;

const SQL_GET_ATTRIBUTES = `
  SELECT
    "attname" AS "name"
  FROM "pg_catalog"."pg_attribute"
  WHERE
    "attrelid" = $1
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
    return (await this.client.query<Schema>(SQL_GET_SCHEMAS)).rows;
  }

  async getEntities(schemaId: string) {
    return (await this.client.query<Entity>(SQL_GET_ENTITIES, [schemaId])).rows;
  }

  async getAttributes(relationId: string) {
    const { rows } = await this.client.query<{ name: string }>(SQL_GET_ATTRIBUTES, [relationId]);
    return rows.map(e => e.name);
  }

  async query(sql: string) {
    return await this.client.query(sql);
  }

  async queryNoTypeCasting(sql: string) {
    return await this.client.query({
      text: sql,
      types: {
        getTypeParser: () => (val: string) => val,
      },
    });
  }
}
