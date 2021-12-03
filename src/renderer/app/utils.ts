import { Connection } from './types';

export function findExistingConnection(connections: Connection[], connection: Connection) {
  const { type, host, port, database, user, password } = connection;

  return connections.find(e => {
    return e.type === type &&
      e.host === host &&
      e.port === port &&
      e.database === database &&
      e.user === user &&
      e.password === password;
  });
}
