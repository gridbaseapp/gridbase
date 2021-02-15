import * as React from 'react';
import { useState } from 'react';
import { Client } from 'pg';
import styles from './NewConnection.scss';

export default function NewConnection({ onConnect, onClose }) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(5432);
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);

  function onCancel(e) {
    e.preventDefault();
    onClose();
  }

  async function connect() {
    try {
      const client = new Client({ host, port, database, user, password });
      await client.connect();
      setError(null);
      onConnect(client);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.newConnection}>
      <div>
        <input
          type="text"
          placeholder="Host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Port"
          value={port}
          onChange={(e) => setPort(+e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Database"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="User"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <input type="submit" value="Connect" onClick={connect} />
        or <a href="" onClick={onCancel}>Cancel</a>
      </div>

      <div className={styles.error}>
        {error}
      </div>
    </div>
  );
}
