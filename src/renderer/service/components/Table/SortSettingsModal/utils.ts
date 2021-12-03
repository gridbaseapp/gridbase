import { Column } from '../../../types';
import { Order } from './types';

interface IsEnabled {
  isEnabled: boolean;
}

export function isEnabledComparator(a: IsEnabled, b: IsEnabled) {
  if (a.isEnabled && b.isEnabled) {
    return 0;
  } else if (a.isEnabled) {
    return -1;
  } else {
    return 1;
  }
}

export function mapColumnsToSortSettings(columns: Column[]) {
  return [...columns]
    .filter(e => e.isVisible)
    .sort((a, b) => a.sort.position - b.sort.position)
    .map(({ name, sort }) => {
      const order: Order = sort.order === 'none' ? 'asc' : sort.order;

      return {
        name,
        isEnabled: sort.order !== 'none',
        order,
      };
    })
    .sort(isEnabledComparator)
    .map((e, position) => ({ ...e, position }));
}
