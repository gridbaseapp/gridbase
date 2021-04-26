import { createStore } from 'redux';
import { IConnection } from '../connection';
import LocalStore from '../utils/local-store';

export interface IState {
  localStore: LocalStore;
  connection: IConnection;
}

function rootReducer(state: any, action: any) {
  return state;
}

export function configureStore(localStore: LocalStore, connection: IConnection) {
  return createStore(rootReducer, { localStore, connection });
}
