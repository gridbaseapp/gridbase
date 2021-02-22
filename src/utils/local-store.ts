import Store from 'electron-store';
import { decrypt, encrypt } from './crypto';
import { IConnectionDetails } from '../connection';

const KEY_CONNECTIONS = 'connections';

export default class LocalStore {
  store: Store;
  password: string;

  constructor(password: string) {
    this.store = new Store();
    this.password = password;
  }

  getConnections(): IConnectionDetails[] {
    return this.get(KEY_CONNECTIONS, []);
  }

  setConnections(connections: IConnectionDetails[]) {
    this.set(KEY_CONNECTIONS, connections);
  }

  get(key: string, defaultValue?: any) {
    const value = <string>this.store.get(key);

    if (value) {
      return JSON.parse(decrypt(this.password, value));
    } else {
      return defaultValue;
    }
  }

  set(key: string, value: any) {
    this.store.set(key, encrypt(this.password, JSON.stringify(value)));
  }
}
