import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './SchemaSelector.scss';

interface ISchemaSelectorProps {
  schemas: string[];
  selectedSchema: string;
  onSelectSchema(schema: string): void;
}

export default function SchemaSelector(props: ISchemaSelectorProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  function onToggleDropdown(ev: React.MouseEvent) {
    ev.preventDefault();
    setDropdownVisible(!dropdownVisible);
  }

  function onSelectSchema(ev: React.MouseEvent, schema: string) {
    ev.preventDefault();
    props.onSelectSchema(schema);
    setDropdownVisible(false);
  }

  return (
    <div className={styles.schemaSelector}>
      <a href="" onClick={onToggleDropdown}>{props.selectedSchema}</a>

      <div className={classNames(styles.dropdown, { [styles.visible]: dropdownVisible })}>
        {props.schemas.map(schema => <a href=""
          key={schema}
          className={classNames({ [styles.selected]: schema === props.selectedSchema })}
          onClick={(ev) => onSelectSchema(ev, schema)}
        >{schema}</a>)}
      </div>
    </div>
  );
}
