import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import styles from './SidebarViews.scss';
import { IState } from '../store';

interface ISidebarViewsProps {
  selectedSchema: string;
  selectedView: string | undefined;
  onOpenView(view: string): void;
}

export default function SidebarTables(props: ISidebarViewsProps) {
  const connection = useSelector((state: IState) => state.connection);
  const [views, setViews] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function run() {
      const { rows } = await connection.client.query(`
        SELECT c.relname AS name
        FROM pg_catalog.pg_class c
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind IN ('m', 'v') AND n.nspname = '${props.selectedSchema}'
        ORDER BY c.relname;
      `);

      setViews(rows.map(e => e.name));
    }

    run();
  }, [props.selectedSchema]);

  function onOpenView(ev: React.MouseEvent, view: string) {
    ev.preventDefault();
    props.onOpenView(view);
  }

  function onFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function filteredViews() {
    if (filter.length === 0) return views;
    return views.filter(e => e.includes(filter));
  }

  return (
    <div className={styles.sidebarViews}>
      <div className={styles.list}>
        {filteredViews().map(view => <a
          href=""
          className={classNames({ [styles.selected]: view === props.selectedView})}
          key={view}
          onClick={(ev) => ev.preventDefault()}
          onDoubleClick={(ev) => onOpenView(ev, view)}
        >
          {view}
        </a>)}
      </div>

      <div>
        <input
          className={styles.filter}
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={onFilter}
        />
      </div>
    </div>
  );
}
