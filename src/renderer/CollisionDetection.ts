import { CollisionDetection } from '@dnd-kit/core';

export const inTheMiddle: CollisionDetection = ({
  active,
  collisionRect,
  droppableContainers,
}) => {
  const containers = droppableContainers
    .map(({ id, rect: { current: rect } }) => ({ id, rect }))
    .sort((a, b) => (a.rect?.offsetLeft || 0) - (b.rect?.offsetLeft || 0));

  const activeIndex = containers.findIndex(e => e.id === active.id);

  let droppableContainerId: string | null = null;

  for (const [i, { id, rect }] of containers.entries()) {
    if (!rect) continue;

    const center = rect.offsetLeft + rect.width / 2;

    if (i < activeIndex) {
      if (collisionRect.left < center) {
        droppableContainerId = id;
        break;
      }
    } else if (i > activeIndex) {
      if (collisionRect.right > center) {
        droppableContainerId = id;
      }
    }
  }

  return droppableContainerId;
};
