import React, { ChangeEvent, useEffect, useRef } from 'react';
import { useExclusiveFocus, useHotkey } from '../../../app/hooks';
import { KeyBindings } from '../../../Hotkeys';
import { useGridContext } from '../../hooks';
import { Row } from "../../types";

interface Props {
  row: Row;
  column: string;
}

export function CellInput({ row, column }: Props) {
  const {
    columns,
    onCancelEditCell,
    onEditCell,
    onUpdateCell,
    onSaveChange,
  } = useGridContext();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [row && row.editedCell]);

  const scope = 'CellInput'
  useExclusiveFocus(scope);

  useHotkey(scope, 'escape', () => {
    onUpdateCell && onUpdateCell(row, column, row.cells[column]);
    handleOnBlur();
  }, [row]);

  useHotkey(scope, 'enter', () => {
    handleOnBlur();
  }, [row]);

  useHotkey(scope, 'tab', () => {
    if (!onEditCell || !row.editedCell) return;

    const visibleColumns = [...columns].filter(e => e.isVisible);

    const columnIndex = visibleColumns.findIndex(e => e.name === row.editedCell);
    let nextColumn = visibleColumns[columnIndex + 1];
    if (!nextColumn) nextColumn = visibleColumns[0];

    onEditCell(row, nextColumn);
  }, [columns, row]);

  useHotkey(scope, 'shift+tab', () => {
    if (!onEditCell || !row.editedCell) return;

    const visibleColumns = [...columns].filter(e => e.isVisible);

    const columnIndex = visibleColumns.findIndex(e => e.name === row.editedCell);
    let previousColumn = visibleColumns[columnIndex - 1];
    if (!previousColumn) previousColumn = visibleColumns[visibleColumns.length - 1];

    onEditCell(row, previousColumn);
  }, [columns, row]);

  useHotkey(scope, KeyBindings['cell_input.save'], () => {
    onSaveChange && onSaveChange();
  }, [columns, row]);

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    onUpdateCell && onUpdateCell(row, column, ev.target.value);
  }

  function handleOnBlur() {
    onCancelEditCell && onCancelEditCell();
  }

  const value = row.getValue(column);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value ? String(value) : ''}
      onMouseDown={ev => ev.stopPropagation()}
      onChange={handleChange}
      onBlur={handleOnBlur}
    />
  );
}
