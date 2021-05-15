import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';
import {
  ISchema,
  schemasReducer,
  selectedSchemaReducer,
  selectSchema,
  loadSchemas,
} from './schema';
import {
  IEntity,
  EntityType,
  ENTITY_TYPE_HUMAN,
  entitiesReducer,
  openEntitiesReducer,
  selectedEntityReducer,
  openEntity,
  closeEntity,
  reorderOpenEntities,
  loadEntities,
} from './entity';

export interface IState {
  localStore: LocalStore;
  connection: IConnection;
  schemas: ISchema[];
  selectedSchema: ISchema;
  entities: IEntity[];
  openEntities: IEntity[];
  selectedEntity: IEntity;
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

export {
  IEntity,
  EntityType,
  ENTITY_TYPE_HUMAN,
  ISchema,
  openEntity,
  closeEntity,
  reorderOpenEntities,
  loadEntities,
  selectSchema,
  loadSchemas,
};
