import Store from 'electron-store';
import { decrypt, encrypt, getPasswordFromKeyStore } from './utils';

console.log('---------------------store-----------');
const store = new Store();

export async function loadConnections() {
  const password = await getPasswordFromKeyStore();
  const connections = store.get('connections');

  if (connections) {
    return JSON.parse(decrypt(password, connections));
  } else {
    return [];
  }
}

export async function saveConnections(connections) {
  const password = await getPasswordFromKeyStore();
  store.set('connections', encrypt(password, JSON.stringify(connections)));
}
