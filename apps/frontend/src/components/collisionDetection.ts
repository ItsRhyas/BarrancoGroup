import type { CollisionDetection, UniqueIdentifier } from "@dnd-kit/core";

/**
 * Extra hit margin (in pixels) applied to every droppable rect before
 * distance-based collision detection runs.
 *
 * Firefox reports fractional `getBoundingClientRect` values while dnd-kit
 * rounds pointer coordinates to integers. A droppable whose edge lands on a
 * sub-pixel (e.g. `top: 260.05`) is rejected by `pointerWithin` whenever the
 * pointer rounds to just below that edge, which makes nested character slots
 * un-droppable on Firefox. Inflating the rects absorbs the sub-pixel gap and
 * also makes the small drop targets easier to hit on touch devices.
 *
 * Raised from 4 to 8 for PR2 to give touch users a little more forgiveness
 * without letting nearby slots overlap.
 */
export const HIT_MARGIN_PX = 8;

/**
 * Maximum Euclidean distance (in pixels) from the dragged item's center to an
 * inflated droppable rect for the drop to be accepted.
 *
 * 96px keeps the game forgiving on touch while staying safely below half the
 * tightest anchor gap (chapter 5 scene 2: anchors are 20% of scene width apart,
 * so at a 1000px scene the gap is 200px). This guarantees the nearest valid
 * slot always wins deterministically and prevents accidental snaps to a
 * distant slot.
 */
export const MAX_SNAP_DISTANCE_PX = 96;

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

function pointToRectDistance(
  point: { x: number; y: number },
  rect: RectLike,
): number {
  const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
  const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Collision detector that snaps the dragged item to the nearest valid slot.
 *
 * Steps:
 * 1. Filter droppable containers by type: only containers whose
 *    `data.current.accepts` equals the active item's `data.current.dragType`
 *    are considered. Wrong-type droppables are completely excluded, so dnd-kit
 *    never reports `isOver` for them and they can never receive a drop.
 * 2. Inflate each candidate rect by `HIT_MARGIN_PX` to absorb sub-pixel edges.
 * 3. Compute the Euclidean distance from the collision rect center to the
 *    inflated rect (0 when the center is inside).
 * 4. Reject candidates farther than `MAX_SNAP_DISTANCE_PX`.
 * 5. Sort the remaining candidates ascending by distance and return them.
 *
 * Nested-parent ambiguity is resolved by distance: when a character slot is
 * inside a scene slot, the smaller inner slot is closer to the pointer and
 * therefore outranks its parent.
 */
export const nearestValidTarget: CollisionDetection = ({
  active,
  droppableContainers,
  droppableRects,
  collisionRect,
}) => {
  const dragType = active.data.current?.dragType;
  if (dragType !== "scene" && dragType !== "character") {
    return [];
  }

  const center = {
    x: collisionRect.left + collisionRect.width / 2,
    y: collisionRect.top + collisionRect.height / 2,
  };

  const results: Array<{ id: UniqueIdentifier; distance: number }> = [];

  for (const container of droppableContainers) {
    const accepts = container.data.current?.accepts;
    if (accepts !== dragType) {
      continue;
    }

    const rect = droppableRects.get(container.id);
    if (!rect) {
      continue;
    }

    const inflated = inflateRect(rect);
    const distance = pointToRectDistance(center, inflated);

    if (distance <= MAX_SNAP_DISTANCE_PX) {
      results.push({ id: container.id, distance });
    }
  }

  results.sort(
    (a, b) =>
      a.distance - b.distance ||
      String(a.id).localeCompare(String(b.id)),
  );

  return results.map(({ id }) => ({ id }));
};
