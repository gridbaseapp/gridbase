import { CollisionDetection, CollisionDescriptor } from '@dnd-kit/core';

export function sortCollisionsAsc(
  { data: { value: a } }: CollisionDescriptor,
  { data: { value: b } }: CollisionDescriptor,
) {
  return a - b;
}

export const inTheMiddle: CollisionDetection = ({
  active,
  collisionRect,
  droppableContainers,
  droppableRects,
}) => {
  const sortedContainers = droppableContainers.sort(({ id: aId }, { id: bId }) => {
    const rectA = droppableRects.get(aId)!;
    const rectB = droppableRects.get(bId)!;

    return rectA.left - rectB.left;
  });

  const collisions: CollisionDescriptor[] = [];

  const activeIndex = droppableContainers.findIndex(e => e.id === active.id);

  for (const [i, droppableContainer] of sortedContainers.entries()) {
    const { id } = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const center = rect.left + rect.width / 2;

      if (i < activeIndex) {
        if (collisionRect.left < center) {
          collisions.push({
            id,
            data: { droppableContainer, value: collisionRect.left + center },
          });
        }
      } else if (i > activeIndex) {
        if (collisionRect.right > center) {
          collisions.push({
            id,
            data: { droppableContainer, value: collisionRect.right - center },
          });
        }
      }
    }
  }

  return collisions.sort(sortCollisionsAsc);
};
