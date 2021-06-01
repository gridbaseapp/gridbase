import Store from 'electron-store';
import { decrypt, encrypt } from './crypto';
import { IConnection } from '../connection';

export enum ColumnDirection {
  NONE = 'NONE',
  ASC = 'ASC',
  DESC = 'DESC',
}

interface IColumnOrder {
  direction: ColumnDirection;
  position: number;
}

export interface IColumn {
  name: string;
  width: number;
  order: IColumnOrder;
}

const KEY_CONNECTIONS = 'connections';

export default class LocalStore {
  store: Store;
  password: string;

  constructor(password: string) {
    this.store = new Store();
    this.password = password;
  }

  getConnections(): IConnection[] {
    return this.getSecure(KEY_CONNECTIONS, []);
  }

  setConnections(connections: IConnection[]) {
    this.setSecure(KEY_CONNECTIONS, connections);
  }

  getSchemaId(connectionUUID: string) {
    return <string>this.store.get(`${connectionUUID}-schema-id`);
  }

  setSchemaId(connectionUUID: string, value: string) {
    this.store.set(`${connectionUUID}-schema-id`, value);
  }

  getColumnsSettings(connectionUUID: string, entityId: string) {
    return <IColumn[]>this.store.get(`${connectionUUID}-${entityId}-columns`, []);
  }

  setColumnsSettings(connectionUUID: string, entityId: string, columns: IColumn[]) {
    this.store.set(`${connectionUUID}-${entityId}-columns`, columns);
  }

  getSecure(key: string, defaultValue?: any) {
    const value = <string>this.store.get(key);

    if (value) {
      return JSON.parse(decrypt(this.password, value));
    } else {
      return defaultValue;
    }
  }

  setSecure(key: string, value: any) {
    this.store.set(key, encrypt(this.password, JSON.stringify(value)));
  }
}
