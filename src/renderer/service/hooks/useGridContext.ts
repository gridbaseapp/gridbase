import { useContext } from 'react';
import { GridContext } from '../contexts';

export function useGridContext() {
  const context = useContext(GridContext);

  if (!context) {
    throw new Error('useGridContext must be used within Grid Context Provider');
  }

  return context;
}
