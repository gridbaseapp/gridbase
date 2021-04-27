import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';

export interface ISchema {
  id: number;
  name: string;
}

export interface IState {
  localStore: LocalStore;
  connection: IConnection;
  schemas: ISchema[];
  selectedSchema: ISchema;
}

function schemasReducer(state = [], action: any) {
  if (action.type === 'schemas/set') {
    return action.payload;
  }

  return state;
}

function selectedSchemaReducer(state = null, action: any) {
  if (action.type === 'selectedSchema/set') {
    return action.payload;
  }

  return state;
}

export function loadSchemas() {
  return async (dispatch: any, getState: any) => {
    const { localStore, connection } = getState();

    const lastUsedSchemaId = localStore.getSchemaId(connection.connectionDetails.uuid);

    const { rows } = await connection.client.query(`
      SELECT n.oid AS id, n.nspname AS name
      FROM pg_catalog.pg_namespace n
      WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
      ORDER BY n.nspname;
    `);

    dispatch({ type: 'schemas/set', payload: rows });

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

    dispatch({ type: 'selectedSchema/set', payload: selectedSchema });
  }
}

export function selectSchema(schema: ISchema) {
  return (dispatch: any, getState: any) => {
    const { localStore, connection } = getState();

    localStore.setSchemaId(connection.connectionDetails.uuid, schema.id);
    dispatch({ type: 'selectedSchema/set', payload: schema });
  }
}

const combinedReducers = combineReducers({
  schemas: schemasReducer,
  selectedSchema: selectedSchemaReducer,
});

function rootReducer(state: any, action: any) {
  const localStore = state.localStore;
  delete state.localStore;

  const connection = state.connection;
  delete state.connection;

  const reducedState = combinedReducers(state, action);

  return { localStore, connection, ...reducedState };
}

export function configureStore(localStore: LocalStore, connection: IConnection) {
  return createStore(rootReducer, { localStore, connection }, applyMiddleware(thunk));
}
