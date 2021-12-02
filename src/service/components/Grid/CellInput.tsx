import React, { ChangeEvent, useEffect, useRef } from 'react';
import { useGridContext } from '../../hooks';
import { Row } from "../../types";

interface Props {
  row: Row;
  column: string;
}

export function CellInput({ row, column }: Props) {
  const { onCancelEditCell, onUpdateCell } = useGridContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [row && row.editedCell]);

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
