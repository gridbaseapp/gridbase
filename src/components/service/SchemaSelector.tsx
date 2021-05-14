import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import { ISchema, IState, selectSchema } from '../state';
import styles from './SchemaSelector.scss';

export default function SchemaSelector() {
  const dispatch = useDispatch();

  const schemas = useSelector((state: IState) => state.schemas);
  const selectedSchema = useSelector((state: IState) => state.selectedSchema);

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  function onToggleDropdown(ev: React.MouseEvent) {
    ev.preventDefault();
    setDropdownVisible(!isDropdownVisible);
  }

  function onSelectSchema(ev: React.MouseEvent, schema: ISchema) {
    ev.preventDefault();
    dispatch(selectSchema(schema));
    setDropdownVisible(false);
  }

  return (
    <div className={styles.schemaSelector}>
      <Tippy
        placement="bottom"
        interactive
        visible={isDropdownVisible}
        onClickOutside={() => setDropdownVisible(false)}
        render={attrs => (
          <div className={styles.dropdown}>
            {
              schemas.map(schema => (
                <a
                  href=""
                  key={schema.id}
                  className={classNames({ [styles.selected]: schema.id === selectedSchema?.id })}
                  onClick={(ev) => onSelectSchema(ev, schema)}
                >{schema.name}</a>
              ))
            }
          </div>
        )}
      >
        <a href="" onClick={onToggleDropdown}>{selectedSchema?.name}</a>
      </Tippy>
    </div>
  );
}
