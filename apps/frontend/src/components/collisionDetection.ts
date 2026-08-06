import { pointerWithin, type CollisionDetection } from "@dnd-kit/core";

/**
 * Extra hit margin (in pixels) applied to every droppable rect before
 * pointer-based collision detection runs.
 *
 * Firefox reports fractional `getBoundingClientRect` values while dnd-kit
 * rounds pointer coordinates to integers. A droppable whose edge lands on a
 * sub-pixel (e.g. `top: 260.05`) is rejected by `pointerWithin` whenever the
 * pointer rounds to just below that edge, which makes nested character slots
 * un-droppable on Firefox. Inflating the rects absorbs the sub-pixel gap and
 * also makes the small drop targets easier to hit on touch devices.
 */
const HIT_MARGIN_PX = 4;

interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function inflateRect(rect: RectLike): RectLike {
  return {
    left: rect.left - HIT_MARGIN_PX,
    top: rect.top - HIT_MARGIN_PX,
    right: rect.right + HIT_MARGIN_PX,
    bottom: rect.bottom + HIT_MARGIN_PX,
    width: rect.width + HIT_MARGIN_PX * 2,
    height: rect.height + HIT_MARGIN_PX * 2,
  };
}

/**
 * `pointerWithin` with an inflated hit area for every droppable.
 *
 * Nested droppables still resolve to the innermost target under the pointer
 * because the sort is based on distance from the pointer to the rect corners:
 * the small inner slot always outranks its large parent when the pointer is
 * anywhere near it.
 */
export const inflatedPointerWithin: CollisionDetection = (args) => {
  const { droppableRects, ...rest } = args;
  const inflated = new Map(droppableRects);
  for (const [id, rect] of inflated) {
    inflated.set(id, inflateRect(rect));
  }
  return pointerWithin({ ...rest, droppableRects: inflated });
};
