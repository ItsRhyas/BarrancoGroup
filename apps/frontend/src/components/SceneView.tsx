import type { SceneDef, SceneSlotState, AssetId } from "../game/types";
import { CharacterSlot } from "./CharacterSlot";
import { AssetView } from "./AssetView";

interface SceneViewProps {
  sceneSlotId: string;
  scene: SceneDef;
  slotState: SceneSlotState;
  resolveCharacterAssetId: (characterId: string | null) => AssetId | null;
}

export function SceneView({
  sceneSlotId,
  scene,
  slotState,
  resolveCharacterAssetId,
}: SceneViewProps) {
  return (
    <div className="scene-view">
      <AssetView assetId={scene.sceneAssetId ?? scene.assetId} label={scene.label} className="scene-asset" />
      <div className="scene-slots-layer">
        {scene.characterSlots.map((charSlot) => (
          <CharacterSlot
            key={charSlot.id}
            slot={charSlot}
            sceneSlotId={sceneSlotId}
            characterAssetId={resolveCharacterAssetId(slotState.characters[charSlot.id])}
          />
        ))}
      </div>
    </div>
  );
}
