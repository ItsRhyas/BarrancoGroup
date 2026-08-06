import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useReducer, useState } from "react";
import { boardReducer, createInitialBoard } from "../game/reducer";
import { isLevelComplete } from "../game/selectors";
import { validate } from "../game/validation";
import { levels } from "../game/levels";
import type {
  AssetId,
  DragType,
  Level,
  ValidationResult,
} from "../game/types";
import { ElementArea } from "./ElementArea";
import { EndDialog } from "./EndDialog";
import { SceneSlot } from "./SceneSlot";
import { inflatedPointerWithin } from "./collisionDetection";

const INITIAL_LEVEL_INDEX = 0;

function resolveCharacterAssetId(
  level: Level,
  characterId: string | null,
): AssetId | null {
  if (!characterId) {
    return null;
  }
  const character = level.characters.find((c) => c.id === characterId);
  return character?.assetId ?? null;
}

function isDragType(value: unknown): value is DragType {
  return value === "scene" || value === "character";
}

export function GameBoard() {
  const [levelIndex, setLevelIndex] = useState(INITIAL_LEVEL_INDEX);
  const level = useMemo(() => levels[levelIndex] ?? levels[0], [levelIndex]);
  const [board, dispatch] = useReducer(
    boardReducer,
    level,
    createInitialBoard,
  );
  const [result, setResult] = useState<ValidationResult | null>(null);

  // Trigger validation as soon as every slot is filled.
  useEffect(() => {
    if (result || !isLevelComplete(board)) {
      return;
    }
    const nextResult = validate(board, level.expected, level.endings);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(nextResult);
  }, [board, level, result]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const dragType = active.data.current?.dragType;
    const accepts = over.data.current?.accepts;
    if (!isDragType(dragType) || !isDragType(accepts)) {
      return;
    }
    if (dragType !== accepts) {
      return;
    }

    if (dragType === "scene") {
      const sceneSlotId = over.data.current?.sceneSlotId;
      const sceneId = active.id;
      if (typeof sceneSlotId !== "string" || typeof sceneId !== "string") {
        return;
      }
      const scene = level.scenes.find((s) => s.id === sceneId);
      if (!scene) {
        return;
      }
      dispatch({
        type: "PLACE_SCENE",
        sceneSlotId,
        sceneId,
        characterSlotIds: scene.characterSlots.map((s) => s.id),
      });
      return;
    }

    // dragType === "character"
    const charSlotId = over.data.current?.charSlotId;
    const sceneSlotId = over.data.current?.sceneSlotId;
    const characterId = active.id;
    if (
      typeof charSlotId !== "string" ||
      typeof sceneSlotId !== "string" ||
      typeof characterId !== "string"
    ) {
      return;
    }
    dispatch({
      type: "PLACE_CHARACTER",
      sceneSlotId,
      charSlotId,
      characterId,
    });
  };

  const handleAdvance = () => {
    if (levelIndex < levels.length - 1) {
      const nextIndex = levelIndex + 1;
      const nextLevel = levels[nextIndex] ?? levels[0];
      // Load the next level's board in the SAME update as the index change.
      // Loading it in an effect would render the new level against the old
      // board for one frame and crash on the missing scene slot.
      setLevelIndex(nextIndex);
      dispatch({ type: "LOAD_LEVEL", level: nextLevel });
    }
    setResult(null);
  };

  const handleRetry = () => {
    dispatch({ type: "RESET_LEVEL", level });
    setResult(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={inflatedPointerWithin}
      onDragEnd={handleDragEnd}
    >
      <main className="game-board">
        <header className="game-header">
          <h1>{level.title}</h1>
          <p>{level.narrative}</p>
        </header>

        <section className="board-area" aria-label="Tablero de escenas">
          {level.sceneSlots.map((sceneSlot) => (
            <SceneSlot
              key={sceneSlot.id}
              slot={sceneSlot}
              slotState={board[sceneSlot.id]}
              scene={
                level.scenes.find((s) => s.id === board[sceneSlot.id].sceneId) ??
                null
              }
              resolveCharacterAssetId={(characterId) =>
                resolveCharacterAssetId(level, characterId)
              }
            />
          ))}
        </section>

        <ElementArea level={level} />

        <EndDialog
          result={result}
          endings={level.endings}
          isFinalLevel={levelIndex === levels.length - 1}
          onAdvance={handleAdvance}
          onRetry={handleRetry}
        />
      </main>
    </DndContext>
  );
}
