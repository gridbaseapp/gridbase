import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';

export interface ISchema {
  id: string;
  name: string;
}

export enum EntityType {
  Table,
  View,
  MaterializeView,
}

export interface IEntity {
  id: string;
  name: string;
  type: EntityType;
}

export interface IState {
  localStore: LocalStore;
  connection: IConnection;
  schemas: ISchema[];
  selectedSchema: ISchema;
  entities: IEntity[];
  openEntities: IEntity[];
  selectedEntity: IEntity;
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
      SELECT oid AS id, nspname AS name
      FROM pg_catalog.pg_namespace
      WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'
      ORDER BY nspname;
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
  };
}

export function selectSchema(schema: ISchema) {
  return (dispatch: any, getState: any) => {
    const { localStore, connection } = getState();

    localStore.setSchemaId(connection.connectionDetails.uuid, schema.id);
    dispatch({ type: 'selectedSchema/set', payload: schema });
  };
}

function entitiesReducer(state = [], action: any) {
  if (action.type === 'entities/set') {
    return action.payload;
  }

  return state;
}

function selectedEntityReducer(state = null, action: any) {
  if (action.type === 'selectedEntity/set') {
    return action.payload;
  }

  return state;
}

function openEntitiesReducer(state: IEntity[] = [], action: any) {
  if (action.type === 'openEntities/add') {
    return [...state, action.payload];
  }

  if (action.type === 'openEntities/remove') {
    return state.filter(e => e !== action.payload);
  }

  return state;
}

export function loadEntities(schema: ISchema) {
  return async (dispatch: any, getState: any) => {
    const { connection } = getState();

    const { rows } = await connection.client.query(`
      SELECT oid AS id, relname AS name,
        CASE relkind
          WHEN 'r' THEN ${EntityType.Table}
          WHEN 'v' THEN ${EntityType.View}
          WHEN 'm' THEN ${EntityType.MaterializeView}
        END AS type
      FROM pg_catalog.pg_class
      WHERE
        relnamespace = '${schema.id}'
        AND relkind IN ('r', 'v', 'm')
      ORDER BY relname;
    `);

    dispatch({ type: 'entities/set', payload: rows });
  };
}

export function openEntity(entity: IEntity) {
  return (dispatch: any, getState: any) => {
    const { openEntities } = getState();

    if (!openEntities.map((e: IEntity) => e.id).includes(entity.id)) {
      dispatch({ type: 'openEntities/add', payload: entity });
    }

    dispatch({ type: 'selectedEntity/set', payload: entity });
  };
}

export function closeEntity(entity: IEntity) {
  return (dispatch: any, getState: any) => {
    const { openEntities, selectedEntity } = getState();
    const entityIndex = openEntities.map((e: IEntity) => e.id).indexOf(entity.id);

    if (selectedEntity.id === entity.id) {
      let newEntity = openEntities[entityIndex + 1];
      if (!newEntity) newEntity = openEntities[entityIndex - 1];
      if (!newEntity) newEntity = null;

      dispatch({ type: 'selectedEntity/set', payload: newEntity });
    }

    dispatch({ type: 'openEntities/remove', payload: entity });
  };
}

const combinedReducers = combineReducers({
  schemas: schemasReducer,
  selectedSchema: selectedSchemaReducer,
  entities: entitiesReducer,
  openEntities: openEntitiesReducer,
  selectedEntity: selectedEntityReducer,
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
