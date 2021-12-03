import { Attribute } from '../types';

interface UpdatedCells {
  [key: string]: string;
}

export class Row {
  private _isActive: boolean = false;
  private _isSelected: boolean = false;
  private _isDeleted: boolean = false;
  private _isAdded: boolean = false;
  private _editedCell: string | null = null;
  readonly updatedCells: UpdatedCells = {};
  readonly cells: any;
  readonly attributes: Attribute[];

  constructor(attributes: Attribute[], cells: any, updatedCells = {}) {
    this.attributes = attributes;
    this.cells = cells;
    this.updatedCells = updatedCells;
  }

  getDefaultValue(field: string) {
    const attribute = this.attributes.find(e => e.name === field);
    return attribute?.default;
  }

  getValue(field: string) {
    let value = null;

    if (field in this.updatedCells) {
      value = this.updatedCells[field];
    } else {
      value = this.cells[field];
    }

    return value === null ? null : String(value);
  }

  updateValue(field: string, value: string) {
    if (this.cells[field] === value) {
      delete this.updatedCells[field];
    } else {
      this.updatedCells[field] = value;
    }
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(val: boolean) {
    this._isSelected = val;
    this._isActive = val;
  }

  get isSelected() {
    return this._isSelected;
  }

  set isSelected(val: boolean) {
    this._isActive = false;
    this._isSelected = val;
  }

  get isAdded() {
    return this._isAdded;
  }

  set isAdded(val: boolean) {
    this._isAdded = val;
  }

  get isDeleted() {
    return this._isDeleted;
  }

  set isDeleted(val: boolean) {
    this._isDeleted = val;
  }

  get editedCell() {
    return this._editedCell;
  }

  set editedCell(val: string | null) {
    this._editedCell = val;
  }

  get isEdited() {
    return Object.keys(this.updatedCells).length > 0;
  }

  get hasChanges() {
    return this.isEdited || this.isDeleted || this.isAdded;
  }
}
