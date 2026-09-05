import type { BoardAction, BoardState, Level } from "./types";

export function createInitialBoard(level: Level): BoardState {
  const board: BoardState = {};
  for (const sceneSlot of level.sceneSlots) {
    const expectedSceneId = level.expected.scenes[sceneSlot.id];
    const expectedScene = expectedSceneId
      ? level.scenes.find((s) => s.id === expectedSceneId)
      : undefined;
    const characters: Record<string, string | null> = {};
    for (const charSlot of expectedScene?.characterSlots ?? []) {
      characters[charSlot.id] = null;
    }
    board[sceneSlot.id] = {
      sceneId: null,
      characters,
    };
  }
  return board;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "LOAD_LEVEL": {
      return createInitialBoard(action.level);
    }
    case "PLACE_SCENE": {
      const sceneSlot = state[action.sceneSlotId];
      if (!sceneSlot) {
        return state;
      }
      const characters: Record<string, string | null> = {};
      for (const charSlotId of action.characterSlotIds) {
        characters[charSlotId] = sceneSlot.characters[charSlotId] ?? null;
      }
      return {
        ...state,
        [action.sceneSlotId]: {
          sceneId: action.sceneId,
          characters,
        },
      };
    }
    case "PLACE_CHARACTER": {
      const sceneSlot = state[action.sceneSlotId];
      if (!sceneSlot || sceneSlot.characters[action.charSlotId] === undefined) {
        return state;
      }
      return {
        ...state,
        [action.sceneSlotId]: {
          ...sceneSlot,
          characters: {
            ...sceneSlot.characters,
            [action.charSlotId]: action.characterId,
          },
        },
      };
    }
    case "RESET_LEVEL": {
      return createInitialBoard(action.level);
    }
    default: {
      return state;
    }
  }
}
