import Store from 'electron-store';
import { encrypt, decrypt } from './crypto';

export class Stash {
  private readonly store = new Store();
  private readonly password: string;

  constructor(password: string) {
    this.password = password;
  }

  get(key: string, defaultValue?: any) {
    return this.store.get(key, defaultValue);
  }

  set(key: string, value: any) {
    this.store.set(key, value);
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
