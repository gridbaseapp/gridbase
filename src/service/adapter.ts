import { Client } from 'pg';
import { Connection } from '../app/types';
import { Attribute, Schema, EntityType, Entity } from './types';

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
    END AS "type",
    "relnamespace" AS "schemaId",
    'fresh' AS "status"
  FROM "pg_catalog"."pg_class"
  WHERE
    "relkind" IN ('r', 'v', 'm')
  ORDER BY "relname";
`;

const SQL_GET_ATTRIBUTES = `
  SELECT
    "pg_attribute"."attname" AS "name",
    (
      SELECT
        "pg_catalog"."pg_get_expr"("pg_attrdef"."adbin", "pg_attrdef"."adrelid", true)
      FROM "pg_catalog"."pg_attrdef"
      WHERE
        "pg_attrdef"."adrelid" = "pg_attribute"."attrelid"
        AND "pg_attrdef"."adnum" = "pg_attribute"."attnum"
        AND "pg_attribute"."atthasdef"
    ) default,
    (
      SELECT
        true
      FROM "pg_catalog"."pg_index"
      WHERE
        "pg_index"."indrelid" = "pg_attribute"."attrelid"
        AND "pg_attribute"."attnum" = any("pg_index"."indkey")
    ) AS "primary"
  FROM "pg_catalog"."pg_attribute"
  WHERE
    "pg_attribute"."attrelid" = $1
    AND "pg_attribute"."attnum" > 0
    AND NOT "pg_attribute"."attisdropped"
  ORDER BY "pg_attribute"."attnum"
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

  async getEntities() {
    return (await this.client.query<Entity>(SQL_GET_ENTITIES)).rows;
  }

  async getAttributes(relationId: string) {
    const { rows } = await this.client.query<Attribute>(SQL_GET_ATTRIBUTES, [relationId]);
    return rows;
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
