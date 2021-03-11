interface ITab {
  node: HTMLElement;
  x: number;
  width: number;
}

interface ICssClass {
  drag: string;
  mirror: string;
}

const executeSync = (() => {
  let pending = Promise.resolve();

  return (callback: (done: () => void) => void) => {
    pending = pending.then(() => new Promise(resolve => callback(resolve)));
  }
})();

function style(node: HTMLElement, styles: any) {
  for (const key in styles) {
    (<any>node.style)[key] = styles[key];
  }
}

function swapTabs(tabs: ITab[], tab1: ITab, tab2: ITab) {
  const idx = tabs.indexOf(tab2);
  const margin = tab2.x - (tab1.x + tab1.width);
  const tab1PrevX = tab1.x;
  const tab2PrevX = tab2.x;

  tab2.x = tab1.x;
  tab1.x = tab2.x + tab2.width + margin;

  tabs.splice(idx - 1, 2, tab2, tab1);

  const tab1NextX = tab1.x;
  const tab2NextX = tab2.x;

  executeSync((done) => {
    setTimeout(() => {
      style(tab1.node, { transition: 'transform 0.15s linear' });
      style(tab2.node, { transition: 'transform 0.15s linear' });

      const animation1 = new Promise(resolve => {
        const transitionend = () => {
          tab1.node.removeEventListener('transitionend', transitionend);
          style(tab1.node, { transition: null, transform: null });
          resolve(null);
        };

        tab1.node.addEventListener('transitionend', transitionend);
        style(tab1.node, { transform: `translate3d(${tab1NextX - tab1PrevX}px, 0, 0)` });
      });

      const animation2 = new Promise(resolve => {
        const transitionend = () => {
          tab2.node.removeEventListener('transitionend', transitionend);
          style(tab2.node, { transition: null, transform: null });
          resolve(null);
        };

        tab2.node.addEventListener('transitionend', transitionend);
        style(tab2.node, { transform: `translate3d(-${tab2PrevX - tab2NextX}px, 0, 0)` });
      });

      Promise.all([animation1, animation2]).then(() => {
        tab1.node.before(tab2.node);
        done();
      });
    }, 0);
  });
}

export default function tabbable(container: HTMLElement, cssClass: ICssClass) {
  const tabsNodes = Array.from(container.children);

  function mousedown(this: HTMLElement, ev: MouseEvent) {
    const containerRect = container.getBoundingClientRect();
    const dragRect = this.getBoundingClientRect();

    const offsetX = ev.clientX - dragRect.x;

    const tabs = Array.from(container.children).map(node => {
      const { x, width } = node.getBoundingClientRect();
      return { node: <HTMLElement>node, x, width };
    });

    let mirror: HTMLElement;

    const mousemove = (ev: MouseEvent) => {
      const drag = tabs.find(e => e.node === this);

      if (!drag) return;

      if (!mirror) {
        mirror = <HTMLElement>this.cloneNode(true);

        mirror.classList.add(cssClass.mirror);
        this.classList.add(cssClass.drag);
        document.body.append(mirror);

        style(mirror, { top: `${dragRect.y}px`, left: `${dragRect.x}px` });
      }

      const dragIdx = tabs.indexOf(drag);
      const leftTab = tabs[dragIdx - 1];
      const rightTab = tabs[dragIdx + 1];

      let positionLeft = ev.clientX - offsetX;
      let positionRight = positionLeft + drag.width;

      if (positionLeft <= containerRect.x) {
        positionLeft = containerRect.x;
      }

      if (positionRight >= containerRect.x + containerRect.width) {
        positionLeft = containerRect.x + containerRect.width - drag.width;
      }

      style(mirror, { transform: `translate3d(${positionLeft - dragRect.x}px, 0, 0)` });

      if (leftTab && leftTab.x + (leftTab.width / 2) > positionLeft) {
        swapTabs(tabs, leftTab, drag);
      }

      if (rightTab && rightTab.x + (rightTab.width / 2) < positionRight) {
        swapTabs(tabs, drag, rightTab);
      }
    };

    const mouseup = () => {
      if (mirror) mirror.remove();
      this.classList.remove(cssClass.drag);

      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  tabsNodes.forEach(tab => (<HTMLElement>tab).addEventListener('mousedown', mousedown));

  return function cleanup() {
    tabsNodes.forEach(tab => (<HTMLElement>tab).removeEventListener('mousedown', mousedown));
  }
}
