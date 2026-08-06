import { useDroppable } from "@dnd-kit/core";
import type { CharacterSlotDef, AssetId } from "../game/types";
import { AssetView } from "./AssetView";

interface CharacterSlotProps {
  slot: CharacterSlotDef;
  sceneSlotId: string;
  characterAssetId: AssetId | null;
}

export function CharacterSlot({
  slot,
  sceneSlotId,
  characterAssetId,
}: CharacterSlotProps) {
  const droppableId = `${sceneSlotId}::${slot.id}`;
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { accepts: "character", charSlotId: slot.id, sceneSlotId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`character-slot ${isOver ? "is-over" : ""}`}
      style={{ left: `${slot.anchorX}%`, top: `${slot.anchorY}%` }}
      data-char-slot-id={slot.id}
    >
      {characterAssetId ? (
        <AssetView assetId={characterAssetId} />
      ) : (
        <span className="slot-placeholder" aria-hidden="true">
          +
        </span>
      )}
    </div>
  );
}
