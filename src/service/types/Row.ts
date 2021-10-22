export class Row {
  private _isActive: boolean = false;
  private _isSelected: boolean = false;
  private readonly cells: any;

  constructor(cells: any) {
    this.cells = cells;
  }

  getValue(field: string) {
    const value = this.cells[field];
    return value ? value.toString() : value;
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
}
