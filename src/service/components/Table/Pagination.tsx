import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './Pagination.scss';

interface Props {
  total: number;
  page: number;
  per: number;
  onChange(page: number): void;
}

export function Pagination({
  total,
  page,
  per,
  onChange,
}: Props) {
  const [inputValue, setInputValue] = useState(String(page));

  useEffect(() => {
    setInputValue(String(page));
  }, [page]);

  const totalPages = Math.ceil(total / per);
  const from = (page - 1) * per + 1;
  const to = Math.min(total, page * per);

  function handleFirstPageClick(ev: React.MouseEvent) {
    ev.preventDefault();
    onChange(1);
  };

  function handleLastPageClick(ev: React.MouseEvent) {
    ev.preventDefault();
    onChange(totalPages);
  };

  function handlePrevPageClick(ev: React.MouseEvent) {
    ev.preventDefault();
    if (page === 1) return;
    onChange(page - 1);
  };

  function handleNextPageClick(ev: React.MouseEvent) {
    ev.preventDefault();
    if (page === totalPages) return;
    onChange(page + 1);
  };

  function handleInputChange(ev: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(ev.target.value);
  }

  function handleInputBlur(ev: React.ChangeEvent<HTMLInputElement>) {
    let val = parseInt(ev.target.value, 10) || 1;

    if (val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setInputValue(String(val));
    onChange(val);
  }

  return (
    <div className={styles.pagination}>
      {from} - {to} of {total}

      <a
        className={
          classNames(styles.button, { [styles.disabled]: page  === 1 })
        }
        onClick={handleFirstPageClick}
      >&laquo;</a>

      <a
        className={
          classNames(styles.button, { [styles.disabled]: page  === 1 })
        }
        onClick={handlePrevPageClick}
      >&lt;</a>

      <span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        /> / {totalPages}
      </span>

      <a
        className={
          classNames(styles.button, { [styles.disabled]: page  === totalPages })
        }
        onClick={handleNextPageClick}
      >&gt;</a>

      <a
        className={
          classNames(styles.button, { [styles.disabled]: page  === totalPages })
        }
        onClick={handleLastPageClick}
      >&raquo;</a>
    </div>
  );
}
