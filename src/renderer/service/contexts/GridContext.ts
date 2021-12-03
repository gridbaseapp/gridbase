import { createContext } from 'react';
import { GridContextDescriptor } from '../types';

export const GridContext = createContext<GridContextDescriptor | undefined>(undefined);
