import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
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
  setOpenEntities,
  loadEntities,
} from './entity';
import { PostgreSQL } from '../adapters/PostgreSQL';

export interface IState {
  localStore: LocalStore;
  adapter: PostgreSQL;
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

  const adapter = state.adapter;
  delete state.adapter;

  const reducedState = combinedReducers(state, action);

  return { localStore, adapter, ...reducedState };
}

export function configureStore(localStore: LocalStore, adapter: PostgreSQL) {
  return createStore(rootReducer, { localStore, adapter }, applyMiddleware(thunk));
}

export {
  IEntity,
  EntityType,
  ENTITY_TYPE_HUMAN,
  ISchema,
  openEntity,
  closeEntity,
  setOpenEntities,
  loadEntities,
  selectSchema,
  loadSchemas,
};
