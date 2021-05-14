export interface ISchema {
  id: string;
  name: string;
}

const SCHEMAS_SET = 'schemas/set';
const SELECTED_SCHEMA_SET = 'selectedSchema/set';

export function schemasReducer(state = [], action: any) {
  if (action.type === SCHEMAS_SET) {
    return action.payload;
  }

  return state;
}

export function selectedSchemaReducer(state = null, action: any) {
  if (action.type === SELECTED_SCHEMA_SET) {
    return action.payload;
  }

  return state;
}

function setSchemas(rows: ISchema[]) {
  return { type: SCHEMAS_SET, payload: rows };
}

function setSelectedSchema(schema: ISchema) {
  return { type: SELECTED_SCHEMA_SET, payload: schema };
}

export function loadSchemas() {
  return async (dispatch: any, getState: any) => {
    const { localStore, connection } = getState();

    const lastUsedSchemaId = localStore.getSchemaId(connection.connectionDetails.uuid);

    const { rows } = await connection.client.query(`
      SELECT oid AS id, nspname AS name
      FROM pg_catalog.pg_namespace
      WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'
      ORDER BY nspname;
    `);

    dispatch(setSchemas(rows));

    const schemaIds = rows.map((e: ISchema) => e.id);
    const publicSchema = rows.find((e: ISchema) => e.name === 'public');

    let selectedSchema = null;

    if (lastUsedSchemaId && schemaIds.includes(lastUsedSchemaId)) {
      selectedSchema = rows.find((e: ISchema) => e.id === lastUsedSchemaId);
    } else if (schemaIds.includes(publicSchema.id)) {
      selectedSchema = publicSchema;
    } else if (rows.length > 0) {
      selectedSchema = rows[0];
    }

    dispatch(setSelectedSchema(selectedSchema));
  };
}

export function selectSchema(schema: ISchema) {
  return (dispatch: any, getState: any) => {
    const { localStore, connection } = getState();

    localStore.setSchemaId(connection.connectionDetails.uuid, schema.id);
    dispatch(setSelectedSchema(schema));
  };
}
