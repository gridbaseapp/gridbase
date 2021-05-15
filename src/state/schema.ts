import { IState } from '.';

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
    const { localStore, adapter } = <IState>getState();

    const lastUsedSchemaId = localStore.getSchemaId(adapter.connection.uuid);

    const schemas = await adapter.getSchemas();

    dispatch(setSchemas(schemas));

    const schemaIds = schemas.map((e: ISchema) => e.id);
    const publicSchema = schemas.find((e: ISchema) => e.name === 'public');

    let selectedSchema = null;

    if (lastUsedSchemaId && schemaIds.includes(lastUsedSchemaId)) {
      selectedSchema = schemas.find((e: ISchema) => e.id === lastUsedSchemaId);
    } else if (schemaIds.includes(publicSchema.id)) {
      selectedSchema = publicSchema;
    } else if (schemas.length > 0) {
      selectedSchema = schemas[0];
    }

    dispatch(setSelectedSchema(selectedSchema));
  };
}

export function selectSchema(schema: ISchema) {
  return (dispatch: any, getState: any) => {
    const { localStore, adapter } = <IState>getState();

    localStore.setSchemaId(adapter.connection.uuid, schema.id);
    dispatch(setSelectedSchema(schema));
  };
}
