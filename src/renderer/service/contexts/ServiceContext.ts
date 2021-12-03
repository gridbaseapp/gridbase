import { createContext } from 'react';
import { ServiceContextDescriptor } from '../types';

export const ServiceContext = createContext<ServiceContextDescriptor | undefined>(undefined);
