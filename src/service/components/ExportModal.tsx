import React, { ChangeEvent, useState } from 'react';
import { ipcRenderer } from 'electron';
import { tmpdir } from 'os';
import { appendFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import stringify from 'csv-stringify/lib/sync';
import { fragment } from 'xmlbuilder2';
import classNames from 'classnames';
import { useExclusiveFocus, useHotkey } from '../../app/hooks';
import { Column, Entity, Row } from '../types';
import styles from './ExportModal.scss';
import { useServiceContext } from '../hooks';

type DataToExport = 'selection' | 'page' | 'everything';
type Format = 'csv' | 'json' | 'xml';

interface Props {
  entity: Entity;
  columns: Column[];
  rows: Row[];
  total: number;
  page: number;
  perPage: number;
  onClose(): void;
}

export function ExportModal({
  entity,
  columns,
  rows,
  total,
  page,
  perPage,
  onClose,
}: Props) {
  const { adapter, schemas } = useServiceContext();

  const scope = 'SortSettingsModal';

  useExclusiveFocus(scope);

  useHotkey(scope, 'escape', () => {
    onClose();
  });

  const hasSelection = rows.some(e => e.isSelected);
  const hasMultiplePages = rows.length < total;

  const [
    dataToExport,
    setDataToExport,
  ] = useState<DataToExport | null>(!hasSelection && !hasMultiplePages ? 'everything' : null);

  const [format, setFormat] = useState<Format | null>(null);

  function handleDataToExportChange(ev: ChangeEvent<HTMLInputElement>) {
    setDataToExport(ev.target.value as DataToExport);
  }

  function handleFormatChange(ev: ChangeEvent<HTMLInputElement>) {
    setFormat(ev.target.value as Format);
  }

  async function handleExport() {
    if (!dataToExport) return;
    if (!format) return;

    const order = columns
      .filter(e => e.sort.order !== 'none')
      .sort((a, b) => a.sort.position - b.sort.position)
      .map(e => [e.name, e.sort.order].join(' '))
      .join(', ')

    const schema = schemas.find(e => e.id === entity.schemaId)!;
    const relation = `"${schema.name}"."${entity.name}"`;
    const orderSQL = order.length === 0 ? '' : `ORDER BY ${order}`;

    const path = `${tmpdir()}/${uuid()}`;

    const cols = columns.filter(e => e.isVisible).map(e => e.name);

    if (dataToExport === 'selection') {
      if (format === 'csv') {
        let values = [];

        values.push(cols);

        values = values.concat(rows
          .filter(e => e.isSelected)
          .map(row => cols.map(col => String(row.getValue(col)))));

        const data = stringify(values);
        appendFileSync(path, data);
      }

      if (format === 'json') {
        const values = rows.filter(e => e.isSelected)
          .map(row => {
            const obj: any = {};

            cols.forEach(col => obj[col] = String(row.getValue(col)))

            return obj;
          });

        const data = JSON.stringify(values);
        appendFileSync(path, data);
      }

      if (format === 'xml') {
        let data = '<records>\n';

        rows.filter(e => e.isSelected)
          .forEach(row => {
            const fr = fragment().ele('record');

            cols.forEach(col => {
              fr.ele(col).txt(String(row.getValue(col)));
            });

            data += fr.end({ prettyPrint: true }) + '\n';
          });

        data += '</records>';

        appendFileSync(path, data);
      }
    } else if (dataToExport === 'page') {
      const offset = (page - 1) * perPage;

      const SQLRows = `
        SELECT *
        FROM ${relation}
        ${orderSQL}
        LIMIT ${perPage}
        OFFSET ${offset}
      `;

      const result = await adapter.queryNoTypeCasting(SQLRows);
      const rows = result.rows.map(e => new Row([], e));

      if (format === 'csv') {
        let values = [];

        values.push(cols);

        values = values.concat(rows
          .map(row => cols.map(col => String(row.getValue(col)))));

        const data = stringify(values);
        appendFileSync(path, data);
      }

      if (format === 'json') {
        const values = rows
          .map(row => {
            const obj: any = {};

            cols.forEach(col => obj[col] = String(row.getValue(col)))

            return obj;
          });

        const data = JSON.stringify(values);
        appendFileSync(path, data);
      }

      if (format === 'xml') {
        let data = '<records>\n';

        rows.forEach(row => {
          const fr = fragment().ele('record');

          cols.forEach(col => {
            fr.ele(col).txt(String(row.getValue(col)));
          });

          data += fr.end({ prettyPrint: true }) + '\n';
        });

        data += '</records>';

        appendFileSync(path, data);
      }
    } else {
      let page = 0;
      const perPage = 1000;

      while (true) {
        const offset = page * perPage;

        const SQLRows = `
          SELECT *
          FROM ${relation}
          ${orderSQL}
          LIMIT ${perPage}
          OFFSET ${offset}
        `;

        const result = await adapter.queryNoTypeCasting(SQLRows);
        const rows = result.rows.map(e => new Row([], e));

        if (format === 'csv') {
          let values = [];

          if (page === 0) values.push(cols);

          values = values.concat(rows
            .map(row => cols.map(col => String(row.getValue(col)))));

          const data = stringify(values);
          appendFileSync(path, data);
        }

        if (format === 'json') {
          const values = rows
            .map(row => {
              const obj: any = {};

              cols.forEach(col => obj[col] = String(row.getValue(col)))

              return obj;
            });

          const data = JSON.stringify(values);
          appendFileSync(path, data);
        }

        if (format === 'xml') {
          let data = page === 0 ? '<records>\n' : '';

          rows.forEach(row => {
            const fr = fragment().ele('record');

            cols.forEach(col => {
              fr.ele(col).txt(String(row.getValue(col)));
            });

            data += fr.end({ prettyPrint: true }) + '\n';
          });

          if (rows.length === 0) data += '</records>';

          appendFileSync(path, data);
        }

        page += 1;
        if (rows.length === 0) break;
      }
    }

    ipcRenderer.send('export-ready', { name: entity.name, format, path });
    onClose();
  }

  return (
    <div className={styles.backdrop} onClick={() => onClose()}>
      <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>

        {(hasSelection || hasMultiplePages) && (
          <div className={styles.section}>
            <h3>Data to export</h3>
            <div>
              {hasSelection && (
                <label className={styles.label}>
                  <input
                    type="radio"
                    name="dataToExport"
                    value="selection"
                    onChange={handleDataToExportChange}
                  />
                  Selection
                </label>
              )}
              {hasMultiplePages && (
                <label className={styles.label}>
                  <input
                    type="radio"
                    name="dataToExport"
                    value="page"
                    onChange={handleDataToExportChange}
                  />
                  Current Page
                </label>
              )}
              {(hasSelection || hasMultiplePages) && (
                <label className={styles.label}>
                  <input
                    type="radio"
                    name="dataToExport"
                    value="everything"
                    onChange={handleDataToExportChange}
                  />
                  Everything
                </label>
              )}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3>Format</h3>
          {dataToExport && (
            <div>
              <label className={styles.label}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  onChange={handleFormatChange}
                />
                CSV
              </label>
              <label className={styles.label}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  onChange={handleFormatChange}
                />
                JSON
              </label>
              <label className={styles.label}>
                <input
                  type="radio"
                  name="format"
                  value="xml"
                  onChange={handleFormatChange}
                />
                XML
              </label>
            </div>
          )}
        </div>

        <a
          className={
            classNames(
              styles.exportButton,
              { [styles.disabled]: !dataToExport || !format },
            )
          }
          onClick={handleExport}
        >Export</a>

      </div>
    </div>
  );
}
