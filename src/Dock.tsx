import React from 'react';
import styles from 'Dock.scss';

export default function Dock({ connections, onNewConnection, onSelectConnection }) {
  function addConnection(e) {
    e.preventDefault();
    onNewConnection();
  }

  function selectConnection(e, connection) {
    e.preventDefault();
    onSelectConnection(connection);
  }

  return (
    <div className={styles.dock}>
      {connections.map((conn, i) => {
        return <a
          href=""
          key={i}
          onClick={(e) => selectConnection(e, conn)}
        >{conn.database}</a>;
      })}
      <a href="" onClick={addConnection}>+</a>
    </div>
  );
}
