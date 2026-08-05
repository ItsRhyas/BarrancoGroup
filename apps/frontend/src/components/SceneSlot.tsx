import { useDroppable } from "@dnd-kit/core";
import type { SceneSlotDef, SceneSlotState, AssetId, SceneDef } from "../game/types";
import { SceneView } from "./SceneView";

interface SceneSlotProps {
  slot: SceneSlotDef;
  slotState: SceneSlotState;
  scene: SceneDef | null;
  resolveCharacterAssetId: (characterId: string | null) => AssetId | null;
}

export function SceneSlot({
  slot,
  slotState,
  scene,
  resolveCharacterAssetId,
}: SceneSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: slot.id,
    data: { accepts: "scene", sceneSlotId: slot.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`scene-slot ${isOver ? "is-over" : ""}`}
      data-scene-slot-id={slot.id}
    >
      {slotState.sceneId && scene ? (
        <SceneView
          sceneSlotId={slot.id}
          scene={scene}
          slotState={slotState}
          resolveCharacterAssetId={resolveCharacterAssetId}
        />
      ) : (
        <div className="scene-slot-placeholder">
          <span className="slot-placeholder" aria-hidden="true">
            +
          </span>
          <span className="scene-slot-label">{slot.label}</span>
        </div>
      )}
    </div>
  );
}
