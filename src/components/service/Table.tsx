import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from './../AutoSizer';
import styles from './Table.scss';
import { IState } from '../store';

interface IField {
  name: string;
  num: number;
  primary: boolean;
}

enum RowType {
  Initial,
  New,
  Edited,
  Deleted,
}

class Row {
  tableName: string
  uid: string
  type: RowType
  fields: any
  values: any
  changes: any

  constructor(tableName: string, fields: IField[], values: any, type = RowType.Initial) {
    this.tableName = tableName;
    this.uid = fields.filter(e => e.primary).map(e => values[e.name]).join('-');
    this.fields = fields;
    this.values = values;
    this.changes = {};
    this.type = type;
  }

  getValue(fieldName: string) {
    const val = this.changes[fieldName] || this.values[fieldName];

    if (val === null || val === undefined) {
      return '[NULL]';
    } else {
      return '' + val;
    }
  }

//   toChangeSQL() {
//     const key = this.fields
//       .filter(e => e.primary)
//       .map(e => `${e.name} = ${this.values[e.name]}`).join(' AND ');

//     if (this.type === RowType.Deleted) {
//       return `DELETE FROM ${this.tableName} WHERE ${key}`;
//     }

//     if (this.type === RowType.New) {
//       const fields = this.fields.map(e => e.name).join(', ');
//       const changes = Object.keys(this.changes).map(key => `'${this.changes[key]}'`).join(', ');
//       return `INSERT INTO ${this.tableName} (${fields}) VALUES (${changes})`;
//     }

//     if (this.type === RowType.Edited) {
//       const changes = Object.keys(this.changes).map(key => `${key} = '${this.changes[key]}'`).join(', ');
//       return `UPDATE ${this.tableName} SET ${changes} WHERE ${key}`;
//     }
//   }
}

interface ITableProps {
  className?: string;
  schema: string;
  table: string;
}

export default function Table(props: ITableProps) {
  const connection = useSelector((state: IState) => state.connection);
  const [fields, setFields] = useState<IField[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

//   const [selectedRow, setSelectedRow] = useState(-1);
//   const [selectedColumn, setSelectedColumn] = useState(-1);
//   const [editedCell, setEditedCell] = useState({ x: -1, y: -1 });

  useEffect(() => {
    async function queryDB() {
      const oidRes = await connection.client.query(`
        SELECT c.oid
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = '${props.table}' AND n.nspname = '${props.schema}'`
      );

      const [metadata, res] = await Promise.all([
        connection.client.query(`
          SELECT a.attname as name, a.attnum as num, i.indisprimary as primary
          FROM pg_catalog.pg_attribute a
          LEFT JOIN pg_index i ON i.indrelid = a.attrelid AND a.attnum = ANY(i.indkey)
          WHERE a.attrelid = '${oidRes.rows[0].oid}' AND a.attnum > 0 AND NOT a.attisdropped
          ORDER BY a.attnum
        `),
        connection.client.query(`SELECT * FROM "${props.schema}"."${props.table}"`),
      ]);

      setFields(metadata.rows);
      setRows(res.rows.map(e => new Row(props.table, metadata.rows, e)));
    };

    queryDB();
  }, []);

//   function addRow(e) {
//     e.preventDefault();
//     const record = Object.assign({}, ...fields.map(e => ({ [e.name]: null })));
//     setRows(prevRows => [...prevRows, new Row(tableName, fields, record, RowType.New)]);
//     setSelectedRow(rows.length);
//     setSelectedColumn(0);
//   }

//   function deleteRow(e) {
//     e.preventDefault();
//     setRows(prevRows => {
//       const newRows = [...prevRows];
//       const row = newRows[selectedRow];
//       row.type = RowType.Deleted;
//       newRows[selectedRow] = row;
//       return newRows;
//     });
//   }

//   function editRow(event, editedRow, field) {
//     setRows(prevRows => {
//       const idx = prevRows.indexOf(editedRow);
//       const newRows = [...prevRows];
//       const row = newRows[idx];
//       if (row.type !== RowType.New) row.type = RowType.Edited;
//       row.changes[field] = event.target.value;
//       newRows[idx] = row;
//       return newRows;
//     });
//   }

//  const body = rows.map((row, i) => {
//    const cols = fields.map((field, j) => {
//      let content = row.getValue(field.name);
//
//       if (editedCell.x === i && editedCell.y === j) {
//         content = <input
//           type="text"
//           value={row.getValue(field.name)}
//           autoFocus
//           onBlur={() => setEditedCell({ x: -1, y: -1 })}
//           onChange={(e) => editRow(e, row, field.name)}
//         />;
//       }
//
//      return (
//        <td
//          key={`${row.uid}-${j}`}
//           onClick={() => setSelectedColumn(j)}
//           onDoubleClick={() => setEditedCell({ x: i, y: j })}
//           className={
//             classNames({
//               [styles.selectedCell]: selectedRow === i && selectedColumn === j
//             })
//           }
//        >
//          {content}
//        </td>
//      );
//    });
//
//    return (
//      <tr
//        key={row.uid}
//        // onClick={() => setSelectedRow(i)}
//        className={
//          classNames({
//            // [styles.selectedRow]: selectedRow === i,
//            // [styles.editedRow]: row.type === RowType.Edited,
//            // [styles.deletedRow]: row.type === RowType.Deleted,
//            // [styles.newRow]: row.type === RowType.New,
//          })
//        }
//      >
//        {cols}
//      </tr>
//    );
//  });

//   function saveChanges(e) {
//     e.preventDefault();

//     rows.forEach(row => {
//       if (row.type === RowType.Initial) return;
//       connection.query(row.toChangeSQL(), (res, err) => { console.log(err) });
//     });
//   }

//   let changes = null;

//   if (rows.some(e => e.type !== RowType.Initial)) {
//     changes = <div>
//       <a href="" onClick={saveChanges}>Save Changes</a>
//     </div>;
//   }

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number, rowIndex: number, style: React.CSSProperties}) => {
    const row = rows[rowIndex];
    const field = row.fields[columnIndex];
    const cell = row.values[field.name];

    const cls = classNames({
      // [styles.selectedRow]: selectedRow === i,
      // [styles.editedRow]: row.type === RowType.Edited,
      // [styles.deletedRow]: row.type === RowType.Deleted,
      // [styles.newRow]: row.type === RowType.New,
    });

    return (
      <div style={style} className={cls}>
        {cell.toString()}
      </div>
    );
  };

  return (
    <div className={classNames(styles.tableRoot, props.className)}>
      <AutoSizer>
        {(width, height) =>
          <FixedSizeGrid
            width={width}
            height={height}
            rowHeight={30}
            columnWidth={100}
            rowCount={rows.length}
            columnCount={fields.length}
          >
            {Cell}
          </FixedSizeGrid>
        }
      </AutoSizer>

      {/* <table className={styles.table}> */}
        {/* <thead> */}
          {/* <tr> */}
            {/* {fields.map(row => <th key={row.num}>{row.name}</th>)} */}
          {/* </tr> */}
        {/* </thead> */}
        {/* <tbody>{body}</tbody> */}
      {/* </table> */}

      {/* {changes} */}
      {/* <div className={styles.actions}> */}
        {/* <a href="" onClick={addRow}>add</a> */}
        {/* {selectedRow > -1 ? <a href="" onClick={deleteRow}>delete</a> : <span>delete</span>} */}
      {/* </div> */}
    </div>
  );
}
