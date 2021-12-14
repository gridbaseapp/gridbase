import darwin from './darwin';
import windows from './windows';

let bindings: typeof darwin;

switch (process.platform) {
  case 'darwin':
    bindings = darwin;
    break;
  default:
    bindings = windows;
    break;
}

export default bindings;
