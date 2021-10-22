import React, { useEffect, useState } from 'react';
import { Connection, ConnectionStatus } from '../types';
import { useExclusiveFocus, useHotkey } from '../hooks';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import styles from './NewConnection.scss';

interface Props {
  isCloseable: boolean;
  onCreate(connection: Connection): Promise<void>;
  onClose(): void;
}

export function NewConnection({ isCloseable, onClose, onCreate }: Props) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState('');

  const {
    formState: { errors },
    handleSubmit,
    register,
    setFocus,
  } = useForm<Connection>({ mode: 'onChange' });

  useEffect(() => {
    setFocus('name');
  }, []);

  const scope = 'NewConnection';

  useExclusiveFocus(scope);

  useHotkey(scope, 'esc', () => {
    if (isCloseable) onClose();
  });

  function handleClose(ev: React.MouseEvent) {
    ev.preventDefault();
    onClose();
  }

  async function submitForm(data: Connection) {
    setStatus('pending');
    setError('');

    try {
      await onCreate({...data, uuid: uuid(), type: 'PostgreSQL'});
    } catch (error) {
      setStatus('error');
      setError((error as Error).message);
    }
  }

  return (
    <div className={styles.newConnection}>
      {isCloseable && <a onClick={handleClose}>Close</a>}

      <form onSubmit={handleSubmit(submitForm)}>
        <div>
          <input
            type="text"
            placeholder="Name"
            {...register('name')}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Host Name / IP Address"
            defaultValue="localhost"
            {...register('host', { required: true })}
          />
          {errors.host && 'is required'}
        </div>

        <div>
          <input
            type="number"
            placeholder="Port"
            defaultValue="5432"
            {...register('port', { required: true })}
          />
          {errors.port && 'is required'}
        </div>

        <div>
          <input
            type="text"
            placeholder="Database"
            {...register('database', { required: true })}
          />
          {errors.database && 'is required'}
        </div>

        <div>
          <input
            type="text"
            placeholder="User"
            {...register('user', { required: true })}
          />
          {errors.user && 'is required'}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
          />
        </div>

        <div>
          {status !== 'pending' && <input type="submit" value="Connect" />}
          {status === 'pending' && 'connecting...'}
        </div>

        {status === 'error' && <div className={styles.error}>Error: {error}</div>}
      </form>
    </div>
  );
}
