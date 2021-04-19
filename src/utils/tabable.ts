interface ICssClass {
  drag: string;
  mirror: string;
}

function style(node: HTMLElement, styles: any) {
  for (const key in styles) {
    (<any>node.style)[key] = styles[key];
  }
}

export default function tabbable(
  container: HTMLElement,
  cssClass: ICssClass,
  onReorder?: (order: number[]) => void,
) {
  function mousedown(this: HTMLElement, ev: MouseEvent) {
    const containerRect = container.getBoundingClientRect();
    const containerLeft = containerRect.x;
    const containerRight = containerLeft + containerRect.width;

    const tabs = (<HTMLElement[]>Array.from(container.children)).map((node, position) => {
      const { x, width, top } = node.getBoundingClientRect();
      return { node, position, x, width, top };
    });

    const drag = tabs.find(e => e.node === this);
    if (!drag) return;

    tabs.forEach((tab) => {
      style(tab.node, { position: 'absolute', left: `${tab.x}px`, width: `${tab.width}px` });
    });

    const offsetX = ev.clientX - drag.x;

    let mirror: HTMLElement;
    const promises: Promise<void>[] = [];

    const mousemove = (ev: MouseEvent) => {
      if (!mirror) {
        mirror = <HTMLElement>drag.node.cloneNode(true);

        mirror.classList.add(cssClass.mirror);
        drag.node.classList.add(cssClass.drag);
        document.body.append(mirror);
      }

      const dragIdx = tabs.indexOf(drag);
      const leftTab = tabs[dragIdx - 1];
      const rightTab = tabs[dragIdx + 1];

      let mirrorLeft = ev.clientX - offsetX;
      let mirrorRight = mirrorLeft + drag.width;

      if (mirrorLeft <= containerLeft) {
        mirrorLeft = containerLeft;
      }

      if (mirrorRight >= containerRight) {
        mirrorLeft = containerRight - drag.width;
      }

      style(mirror, { left: `${mirrorLeft}px`, top: `${drag.top}px` });

      if (leftTab && leftTab.x + (leftTab.width / 2) > mirrorLeft) {
        const margin = drag.x - (leftTab.x + leftTab.width);

        drag.x = leftTab.x;
        leftTab.x = drag.x + drag.width + margin;

        tabs.splice(dragIdx - 1, 2, drag, leftTab);

        style(leftTab.node, { transition: 'left 0.2s ease-in-out', left: `${leftTab.x}px` });
        style(drag.node, { left: `${drag.x}px` });

        const promise = new Promise<void>(resolve => {
          const transitionend = () => {
            leftTab.node.removeEventListener('transitionend', transitionend);
            style(leftTab.node, { transition: null });
            resolve();
          };
          leftTab.node.addEventListener('transitionend', transitionend);
        });

        promises.push(promise);
      }

      if (rightTab && rightTab.x + (rightTab.width / 2) < mirrorRight) {
        const margin = rightTab.x - (drag.x + drag.width);

        rightTab.x = drag.x;
        drag.x = rightTab.x + rightTab.width + margin;

        tabs.splice(dragIdx, 2, rightTab, drag);

        style(rightTab.node, { transition: 'left 0.2s ease-in-out', left: `${rightTab.x}px` });
        style(drag.node, { left: `${drag.x}px` });

        const promise = new Promise<void>(resolve => {
          const transitionend = () => {
            rightTab.node.removeEventListener('transitionend', transitionend);
            style(rightTab.node, { transition: null });
            resolve();
          };
          rightTab.node.addEventListener('transitionend', transitionend);
        });

        promises.push(promise);
      }
    };

    const mouseup = () => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);

      if (mirror) {
        if (mirror.getBoundingClientRect().x !== drag.x) {
          style(mirror, { transition: 'left 0.2s ease-in-out', left: `${drag.x}px` });

          const promise = new Promise<void>(resolve => {
            mirror.addEventListener('transitionend', () => {
              resolve();
            });
          });

          promises.push(promise);
        }
      }

      Promise.all(promises).then(() => {
        if (mirror) mirror.remove();
        this.classList.remove(cssClass.drag);

        tabs.forEach(tab => {
          style(tab.node, { position: null, left: null, width: null });
        });
        // @ts-ignore
        container.replaceChildren(...tabs.map(e => e.node));
        if (onReorder) onReorder(tabs.map(e => e.position));
      });
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  const tabsNodes = <HTMLElement[]>Array.from(container.children);
  tabsNodes.forEach(tab => tab.addEventListener('mousedown', mousedown));

  return function cleanup() {
    tabsNodes.forEach(tab => tab.removeEventListener('mousedown', mousedown));
  }
}
