import { useContext } from 'react';
import { ServiceContext } from '../contexts';

export function useServiceContext() {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error('useServiceContext must be used within Service Context Provider');
  }

  return context;
}
