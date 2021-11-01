import { EntityType  } from './EntityType';
import { Schema } from './Schema';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  schema: Schema;
  status: 'fresh' | 'new' | 'unsaved';
}
