import React, { useEffect, useState } from 'react';
import http from 'http';
import semver from 'semver';
import { ipcRenderer } from 'electron';
import { marked } from 'marked';
import styles from './NewVersionModal.scss';
import { AvailableUpdate } from '../types';

interface Release {
  version: string;
  description: string;
}

interface Props {
  availableUpdate: AvailableUpdate;
  onClose(): void;
}

export function NewVersionModal({ availableUpdate, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setStatus('loading');

    http.get(RELEASE_API_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const releases: Release[] = JSON.parse(data);

        let out = '';

        releases.forEach(release => {
          const from = semver.gt(release.version, availableUpdate.currentVersion);
          const to = semver.lte(release.version, availableUpdate.availableVersion);

          if (from && to) {
            out += marked.parse(release.description);
          }
        });

        setDescription(out);
      });
    });

    setStatus('success');
  }, []);

  function handleDownload() {
    ipcRenderer.send('autoupdater:quit-and-install');
  }

  return (
    <div className={styles.newVersionModal}>
      <div className={styles.body}>
        {status === 'loading' && 'loading...'}
        {status === 'success' && (
          <>
            <a onClick={onClose}>Close</a>
            <div dangerouslySetInnerHTML={{ __html: description }}></div>
            <a onClick={handleDownload}>Download version {availableUpdate.availableVersion}</a>
          </>
        )}
      </div>
    </div>
  );
}
