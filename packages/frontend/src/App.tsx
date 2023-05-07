import styles from './App.scss';

export function App() {
  return (
    <div>
      <h1 className={styles.headerBlue}>Header blue</h1>
      <h1 className={styles.headerGreen}>Header green</h1>
      <h1 className={styles.header}>Header red</h1>
    </div>
  );
}
