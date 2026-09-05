import type { Level } from "../game/types";
import { DraggableItem } from "./DraggableItem";

interface ElementAreaProps {
  level: Level;
}

export function ElementArea({ level }: ElementAreaProps) {
  return (
    <section className="element-area" aria-label="Elementos disponibles">
      <h2 className="element-area-title">Elementos</h2>
      <div className="element-area-card">
        <div className="element-tray">
          {level.scenes.map((scene) => (
            <DraggableItem
              key={scene.id}
              id={scene.id}
              dragType="scene"
              assetId={scene.assetId}
              iconAssetId={scene.iconAssetId}
              label={scene.label}
            />
          ))}
          {level.characters.map((character) => (
            <DraggableItem
              key={character.id}
              id={character.id}
              dragType="character"
              assetId={character.assetId}
              iconAssetId={character.iconAssetId}
              label={character.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
