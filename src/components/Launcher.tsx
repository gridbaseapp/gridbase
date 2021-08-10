import React, { useEffect, useState } from 'react';
import NewConnection from './NewConnection';
import styles from './Launcher.scss'
import { IConnection } from '../connection';
import hotkeys from '../utils/hotkeys';

interface ILauncherProps {
  connections: IConnection[];
  openConnections: IConnection[];
  onCreateConnection(connection: IConnection): Promise<void>;
  onDeleteConnection(connection: IConnection): void;
  onConnect(connection: IConnection): Promise<void>;
  onClose(): void;
}

export default function Launcher(props: ILauncherProps) {
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [error, setError] = useState();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const contexts = hotkeys.getContexts();
    hotkeys.pause(contexts);

    hotkeys.bind('Launcher', {
      'esc': () => {
        if (props.openConnections.length > 0) props.onClose();
      },
      'mod+n': () => {
        setShowNewConnection(true);
      },
    });

    return () => {
      hotkeys.unbind('Launcher');
      hotkeys.unpause(contexts);
    };
  }, []);

  function onDeleteConnection(ev: React.MouseEvent, connection: IConnection) {
    ev.preventDefault();
    props.onDeleteConnection(connection);
  }

  async function onConnect(ev: React.MouseEvent, connection: IConnection) {
    ev.preventDefault();

    try {
      await props.onConnect(connection);
    } catch(err) {
      setError(err.message);
    }
  }

  function onNewConnection(ev: React.MouseEvent) {
    ev.preventDefault();
    setShowNewConnection(true);
  }

  function onClose(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onClose();
  }

  function onFilter(ev: React.ChangeEvent<HTMLInputElement>) {
    setFilter(ev.target.value);
  }

  function filterConnections() {
    if (filter.length === 0) return props.connections;

    return props.connections.filter(e => {
      return e.name.includes(filter) ||
        e.database.includes(filter) ||
        e.host.includes(filter) ||
        e.user.includes(filter);
    });
  }

  const list = filterConnections().map((connection) => {
    const { uuid, name, host, port, database, user } = connection;
    const open = props.openConnections.find(e => e === connection);

    return (
      <div className={styles.connection} key={uuid}>
        {name} / {host} / {port} / {database} / {user}

        {!open && <>
          <a
            href=""
            onClick={(ev) => onConnect(ev, connection)}
          >Connect</a>
          <a
            href=""
            onClick={(ev) => onDeleteConnection(ev, connection)}
          >Delete</a>
        </>}
      </div>
    );
  });

  return (
    <div className={styles.launcher}>
      {(props.connections.length === 0 || showNewConnection) &&
        <NewConnection
          connections={props.connections}
          onCreateConnection={props.onCreateConnection}
          onClose={() => setShowNewConnection(false)}
        />
      }

      {props.openConnections.length > 0 && <a href="" onClick={onClose}>Close</a>}

      <input
        type="text"
        placeholder="Filter"
        autoFocus
        value={filter}
        onChange={onFilter}
      />

      <div className={styles.connection}>
        <a href="" onClick={onNewConnection}>new connection</a>
      </div>

      {list}

      <div className={styles.error}>{error}</div>
    </div>
  );
}
