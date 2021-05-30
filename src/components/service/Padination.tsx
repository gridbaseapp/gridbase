import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './Pagination.scss';

interface IPaginationProps {
  totalRecords: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination(props: IPaginationProps) {
  const [page, setPage] = useState(String(props.page));
  const totalPages = Math.ceil(props.totalRecords / props.perPage);
  const from = (props.page - 1) * props.perPage + 1;
  const to = Math.min(props.totalRecords, props.page * props.perPage);

  useEffect(() => {
    setPage(String(props.page));
  }, [props.page]);

  const firstPage = (ev: React.MouseEvent) => {
    ev.preventDefault();
    props.onPageChange(1);
  };

  const lastPage = (ev: React.MouseEvent) => {
    ev.preventDefault();
    props.onPageChange(totalPages);
  };

  const prevPage = (ev: React.MouseEvent) => {
    ev.preventDefault();
    if (props.page === 1) return;
    props.onPageChange(props.page - 1);
  };

  const nextPage = (ev: React.MouseEvent) => {
    ev.preventDefault();
    if (props.page === totalPages) return;
    props.onPageChange(props.page + 1);
  };

  const onPageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPage(ev.target.value);
  }

  const onPageBlur = (ev: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(ev.target.value, 10) || 1;

    if (val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setPage(String(val));
    props.onPageChange(val);
  }

  return (
    <div className={styles.pagination}>
      {from} - {to} of {props.totalRecords}
      <a
        href=""
        className={classnames(styles.button, { [styles.disabled]: props.page  === 1 })}
        onClick={firstPage}
      >&laquo;</a>
      <a
        href=""
        className={classnames(styles.button, { [styles.disabled]: props.page  === 1 })}
        onClick={prevPage}
      >&lt;</a>

      <span>
        <input type="text" value={page} onChange={onPageChange} onBlur={onPageBlur} /> / {totalPages}
      </span>

      <a
        href=""
        className={classnames(styles.button, { [styles.disabled]: props.page  === totalPages })}
        onClick={nextPage}
      >&gt;</a>
      <a
        href=""
        className={classnames(styles.button, { [styles.disabled]: props.page  === totalPages })}
        onClick={lastPage}
      >&raquo;</a>
    </div>
  );
}
