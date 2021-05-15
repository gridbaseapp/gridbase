import { IState } from '.';
import { ISchema } from './schema';

export enum EntityType {
  Table,
  View,
  MaterializeView,
}

export interface IEntity {
  id: string;
  name: string;
  type: EntityType;
  schema?: ISchema;
}

export const ENTITY_TYPE_HUMAN = {
  0: 'Table',
  1: 'View',
  2: 'MaterializeView',
}

const ENTITIES_SET = 'entities/set';
const SELECTED_ENTITY_SET = 'selectedEntity/set';
const OPEN_ENTITIES_ADD = 'openEntities/add';
const OPEN_ENTITIES_REMOVE = 'openEntities/remove';
const OPEN_ENTITIES_REORDER = 'openEntities/reorder';

export function entitiesReducer(state = [], action: any) {
  if (action.type === ENTITIES_SET) {
    return action.payload;
  }

  return state;
}

export function selectedEntityReducer(state = null, action: any) {
  if (action.type === SELECTED_ENTITY_SET) {
    return action.payload;
  }

  return state;
}

export function openEntitiesReducer(state: IEntity[] = [], action: any) {
  if (action.type === OPEN_ENTITIES_ADD) {
    return [...state, action.payload];
  }

  if (action.type === OPEN_ENTITIES_REMOVE) {
    return state.filter(e => e !== action.payload);
  }

  if (action.type === OPEN_ENTITIES_REORDER) {
    return action.payload
      .map((i: number) => state[i])
      .concat(state.slice(action.payload.length));
  }

  return state;
}

function setEntities(entities: IEntity[]) {
  return { type: ENTITIES_SET, payload: entities };
}

function addOpenEntity(entity: IEntity) {
  return { type: OPEN_ENTITIES_ADD, payload: entity };
}

function removeOpenEntity(entity: IEntity) {
  return { type: OPEN_ENTITIES_REMOVE, payload: entity };
}

export function reorderOpenEntities(order: number[]) {
  return { type: OPEN_ENTITIES_REORDER, payload: order };
}


function setSelectedEntity(entity: IEntity) {
  return { type: SELECTED_ENTITY_SET, payload: entity };
}

export function loadEntities(schema: ISchema) {
  return async (dispatch: any, getState: any) => {
    const { adapter } = <IState>getState();
    const rows = await adapter.getEntities(schema.id);
    dispatch(setEntities(rows.map((e: IEntity) => ({...e, schema}))));
  };
}

export function openEntity(entity: IEntity) {
  return (dispatch: any, getState: any) => {
    const { openEntities } = getState();

    if (!openEntities.map((e: IEntity) => e.id).includes(entity.id)) {
      dispatch(addOpenEntity(entity));
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

      dispatch(setSelectedEntity(newEntity));
    }

    dispatch(removeOpenEntity(entity));
  };
}
