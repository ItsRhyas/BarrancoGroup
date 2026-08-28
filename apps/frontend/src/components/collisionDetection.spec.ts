import { describe, expect, it } from "vitest";
import type { Active, ClientRect, DroppableContainer } from "@dnd-kit/core";
import {
  HIT_MARGIN_PX,
  MAX_SNAP_DISTANCE_PX,
  nearestValidTarget,
} from "./collisionDetection";

function rect(
  left: number,
  top: number,
  width: number,
  height: number,
): ClientRect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}

function collisionRectAt(centerX: number, centerY: number): ClientRect {
  // 10x10 rect centered on the pointer; only the center matters to the algorithm.
  return rect(centerX - 5, centerY - 5, 10, 10);
}

function active(dragType?: string): Active {
  return {
    id: "draggable",
    data: {
      current: dragType ? { dragType } : undefined,
    },
    rect: { current: { initial: null, translated: null } },
  } as unknown as Active;
}

function container(id: string, accepts: string): DroppableContainer {
  return {
    id,
    key: id,
    data: {
      current: { accepts },
    },
    disabled: false,
    node: { current: null },
    rect: { current: null },
  } as unknown as DroppableContainer;
}

interface ArgsOptions {
  dragType?: string;
  cx: number;
  cy: number;
  containers: DroppableContainer[];
  rects: Array<[string, ClientRect]>;
}

function makeArgs(options: ArgsOptions) {
  return {
    active: active(options.dragType),
    collisionRect: collisionRectAt(options.cx, options.cy),
    droppableContainers: options.containers,
    droppableRects: new Map<string, ClientRect>(options.rects),
    pointerCoordinates: null,
  };
}

describe("nearestValidTarget", () => {
  it("only returns droppables whose accepts matches the active dragType", () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "character",
        cx: 5,
        cy: 5,
        containers: [
          container("char-slot", "character"),
          container("scene-slot", "scene"),
        ],
        rects: [
          ["char-slot", rect(0, 0, 10, 10)],
          ["scene-slot", rect(0, 0, 10, 10)],
        ],
      }),
    );

    expect(collisions.map((c) => c.id)).toEqual(["char-slot"]);
  });

  it("returns an empty array when the active item has no dragType", () => {
    const collisions = nearestValidTarget(
      makeArgs({
        cx: 5,
        cy: 5,
        containers: [container("char-slot", "character")],
        rects: [["char-slot", rect(0, 0, 10, 10)]],
      }),
    );

    expect(collisions).toEqual([]);
  });

  it("returns an empty array when no droppable accepts the dragType", () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "scene",
        cx: 5,
        cy: 5,
        containers: [container("char-slot", "character")],
        rects: [["char-slot", rect(0, 0, 10, 10)]],
      }),
    );

    expect(collisions).toEqual([]);
  });

  it("sorts multiple valid candidates by ascending distance", () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "character",
        cx: 28,
        cy: 5,
        containers: [
          container("near", "character"),
          container("mid", "character"),
          container("far", "character"),
        ],
        rects: [
          ["near", rect(0, 0, 10, 10)],
          ["mid", rect(50, 0, 10, 10)],
          ["far", rect(110, 0, 10, 10)],
        ],
      }),
    );

    expect(collisions.map((c) => c.id)).toEqual(["near", "mid", "far"]);
  });

  it("picks the nearest valid slot deterministically", () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "character",
        cx: 35,
        cy: 5,
        containers: [
          container("left", "character"),
          container("right", "character"),
        ],
        rects: [
          ["left", rect(0, 0, 10, 10)],
          ["right", rect(80, 0, 10, 10)],
        ],
      }),
    );

    expect(collisions[0]?.id).toBe("left");
    expect(collisions.map((c) => c.id)).toEqual(["left", "right"]);
  });

  it(`rejects candidates farther than ${MAX_SNAP_DISTANCE_PX}px`, () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "character",
        cx: 0,
        cy: 0,
        containers: [container("out-of-range", "character")],
        rects: [["out-of-range", rect(200, 0, 10, 10)]],
      }),
    );

    expect(collisions).toEqual([]);
  });

  it(`accepts pointers up to ${HIT_MARGIN_PX}px outside the raw rect`, () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "character",
        cx: -6,
        cy: 5,
        containers: [container("char-slot", "character")],
        rects: [["char-slot", rect(0, 0, 10, 10)]],
      }),
    );

    expect(collisions.map((c) => c.id)).toEqual(["char-slot"]);
  });

  it("rejects pointers beyond the snap threshold even after hit-margin inflation", () => {
    const collisions = nearestValidTarget(
      makeArgs({
        dragType: "character",
        cx: -105,
        cy: 5,
        containers: [container("char-slot", "character")],
        rects: [["char-slot", rect(0, 0, 10, 10)]],
      }),
    );

    expect(collisions).toEqual([]);
  });
});
