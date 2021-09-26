import React from 'react';
import { Header } from './Header';
import styles from './GridElement.scss';
import { GUTTER_WIDTH, HEADER_HEIGHT } from './constants';
import { useGridContext } from '../../hooks';

interface Props {
  children: React.ReactNode;
  style: React.CSSProperties;
}

export function GridElement({ children, style }: Props) {
//   const {
//     entity,
//     columns,
//     setColumns,
//     onSelectColumn,
//     onSelectRegion,
//     outerContainer,
//   } = useContext(TableListContext);

//   const contentRef = useRef<HTMLDivElement>(null);
//   const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

//   useEffect(() => {
//     if (contentRef.current && outerContainer.current) {
//       const throttledOnSelectRegion = throttle((top, left, bottom, right) => {
//         onSelectRegion(top, left, bottom, right);
//       }, 50);

//       return selectable(
//         contentRef.current,
//         outerContainer.current,
//         (rect) => {
//           setRect(rect);
//           throttledOnSelectRegion(
//             rect.top,
//             rect.left,
//             rect.top + rect.height,
//             rect.left + rect.width,
//           );
//         },
//         () => setRect({ top: 0, left: 0, width: 0, height: 0 }),
//       );
//     }

//     return undefined;
//   }, [onSelectRegion]);

  const { columns } = useGridContext();

  const height = parseFloat(String(style.height)) + HEADER_HEIGHT;
  const width = GUTTER_WIDTH + columns
    .filter(e => e.isVisible)
    .reduce((acc, e) => acc + e.width, 0);

  return (
    // <div ref={contentRef}>
    <div style={{ ...style, height, width, minWidth: '100%' }}>
      <Header />

      {/* <div
        className={styles.tableListSelection}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      ></div> */}

      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
};
