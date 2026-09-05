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
  Level,
  ValidationResult,
} from "../game/types";
import { ElementArea } from "./ElementArea";
import { EndDialog } from "./EndDialog";
import { SceneSlot } from "./SceneSlot";
import { nearestValidTarget } from "./collisionDetection";

interface GameBoardProps {
  levelIndex: number;
  onAdvance: () => void;
  onComplete: () => void;
  onChapterCompleted?: (index: number) => void;
  onAttempt?: (result: ValidationResult, levelIndex: number) => void;
}

function resolveCharacterAssetId(
  level: Level,
  characterId: string | null,
): AssetId | null {
  if (!characterId) {
    return null;
  }
  const character = level.characters.find((c) => c.id === characterId);
  return character?.sceneAssetId ?? character?.assetId ?? null;
}

export function GameBoard({
  levelIndex,
  onAdvance,
  onComplete,
  onChapterCompleted,
  onAttempt,
}: GameBoardProps) {
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
    if (nextResult.correct) {
      onChapterCompleted?.(levelIndex);
    }
    onAttempt?.(nextResult, levelIndex);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(nextResult);
  }, [board, level, result, levelIndex, onChapterCompleted, onAttempt]);

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
    onAdvance();
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleRetry = () => {
    dispatch({ type: "RESET_LEVEL", level });
    setResult(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={nearestValidTarget}
      autoScroll={false}
      onDragEnd={handleDragEnd}
    >
      <main className="game-board">
        <header className="game-header">
          <h1>{level.title}</h1>
          <p className="game-context">{level.context}</p>
          <p className="game-narrative">{level.narrative}</p>
        </header>

        <section
          className="board-area"
          aria-label="Tablero de escenas"
          data-scene-count={level.sceneSlots.length}
        >
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
          onComplete={handleComplete}
          onRetry={handleRetry}
        />
      </main>
    </DndContext>
  );
}
