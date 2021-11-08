import { EntityType  } from './EntityType';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  schemaId: string;
  status: 'fresh' | 'new' | 'unsaved';
}
