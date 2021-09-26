import React, { useEffect, useRef, useState } from 'react';
import { ConnectionDetails } from './ConnectionDetails';
import { NewConnection } from './NewConnection';
import styles from './Launcher.scss';
import { Connection, Service } from '../types';
import { useExclusiveFocus, useHotkey } from '../hooks';

interface Props {
  connections: Connection[];
  services: Service[];
  onConnect(connection: Connection): Promise<void>;
  onDisconnect(service: Service): void;
  onCreateConnection(connection: Connection): Promise<void>;
  onDeleteConnection(connection: Connection): void;
  onClose(): void;
}

export function Launcher({
  connections,
  services,
  onConnect,
  onDisconnect,
  onCreateConnection,
  onDeleteConnection,
  onClose,
}: Props) {
  const [filter, setFilter] = useState('');
  const [
    isNewConnectionVisible,
    setNewConnectionVisible,
  ] = useState(connections.length === 0);
  const [focusedConnectionIndex, setFocusedConnectionIndex] = useState(-1);

  const filterInputRef = useRef<HTMLInputElement>(null);

  const filteredConnections = connections.filter(({ name, database }) => {
    const query = filter.trim().toLowerCase();
    const lowercaseName = name.toLowerCase();
    const lowercaseDatabase = database.toLowerCase();

    return lowercaseName.includes(query) || lowercaseDatabase.includes(query);
  });

  useEffect(() => {
    if (connections.length === 0) setNewConnectionVisible(true);
  }, [connections]);

  useEffect(() => {
    setFocusedConnectionIndex(-1);
  }, [filter]);

  const scope = 'Launcher';

  useExclusiveFocus(scope, !isNewConnectionVisible);

  useHotkey(scope, 'esc', () => {
    if (services.length > 0) onClose();
  });

  useHotkey(scope, 'mod+n', () => {
    setNewConnectionVisible(true);
  });

  useHotkey(scope, 'mod+f', () => {
    filterInputRef.current?.focus();
  });

  useHotkey(scope, 'down', () => {
    let idx = focusedConnectionIndex + 1;
    if (idx > filteredConnections.length - 1) idx = -1;
    setFocusedConnectionIndex(idx);
  }, [filteredConnections]);

  useHotkey(scope, 'up', () => {
    let idx = focusedConnectionIndex - 1;
    if (idx < -1) idx = filteredConnections.length - 1;
    setFocusedConnectionIndex(idx);
  }, [filteredConnections]);

  useHotkey(scope, 'enter', () => {
    const connection = filteredConnections[focusedConnectionIndex];
    if (connection) onConnect(connection);
  }, [focusedConnectionIndex]);

  function handleClose(ev: React.MouseEvent) {
    ev.preventDefault();
    onClose();
  }

  function handleCloseNewConnection() {
    setNewConnectionVisible(false);
    filterInputRef.current?.focus();
  }

  return (
    <div className={styles.launcher}>
      {isNewConnectionVisible &&
        <NewConnection
          isCloseable={connections.length > 0}
          onCreate={onCreateConnection}
          onClose={handleCloseNewConnection}
        />
      }

      {services.length > 0 && <a href="" onClick={handleClose}>Close</a>}

      <br />

      <input
        ref={filterInputRef}
        type="text"
        placeholder="Filter"
        autoFocus
        value={filter}
        onChange={(ev) => setFilter(ev.target.value)}
      />

      <div>
        <a
          href=""
          onClick={
            (ev) => {
              ev.preventDefault();
              setNewConnectionVisible(true);
            }
          }
        >new connection</a>
      </div>

      {filteredConnections.map(
        (e, idx) => <ConnectionDetails
          key={e.uuid}
          connection={e}
          hasFocus={idx === focusedConnectionIndex}
          service={services.find(s => s.connection === e)}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onDelete={onDeleteConnection}
        />
      )}
    </div>
  );
}
