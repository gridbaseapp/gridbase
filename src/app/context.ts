import { createContext } from 'react';
import { AppContextDescriptor } from './types';

export const Context = createContext<AppContextDescriptor | undefined>(undefined);
