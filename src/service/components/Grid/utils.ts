import { HEADER_HEIGHT } from "./constants";

export function getOffsetForIndex(
  index: number,
  height: number,
  itemCount: number,
  itemSize: number,
  scrollOffset: number,
) {
  const lastItemOffset = Math.max(0, itemCount * itemSize - height + HEADER_HEIGHT);
  const maxOffset = Math.min(lastItemOffset, index * itemSize);
  const minOffset = Math.max(0, index * itemSize - height + itemSize + HEADER_HEIGHT);

  if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
    return scrollOffset;
  } else if (scrollOffset < minOffset) {
    return minOffset;
  } else {
    return maxOffset;
  }
}
