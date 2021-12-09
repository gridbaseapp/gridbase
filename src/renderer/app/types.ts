import { Dispatch, SetStateAction } from 'react';
import { PostgreSQLAdapter } from '../service/adapter';
import { Stash } from './Stash';

export interface Connection {
  uuid: string;
  type: 'PostgreSQL';
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connected'
  | 'pending'
  | 'error';

export interface Service {
  connection: Connection;
  adapter: PostgreSQLAdapter;
}

export interface AppContextDescriptor {
  stash: Stash;
  focus: string[];
  exclusiveFocus: string[];
  setFocus: Dispatch<SetStateAction<string[]>>;
  setExclusiveFocus: Dispatch<SetStateAction<string[]>>;
}

export interface AvailableUpdate {
  currentVersion: string;
  availableVersion: string;
}
