export type AssetId = string;
export type DragType = "scene" | "character";

export interface EmojiAsset {
  type: "emoji";
  emoji: string;
}

export interface ImageAsset {
  type: "image";
  src: string;
}

export type AssetEntry = (EmojiAsset | ImageAsset) & {
  aspectRatio?: number;
};

export type AssetRegistry = Record<AssetId, AssetEntry>;

export interface CharacterSlotDef {
  id: string;
  anchorX: number; // % within scene
  anchorY: number; // % within scene
}

export interface SceneDef {
  id: string;
  assetId: AssetId;
  label: string;
  characterSlots: CharacterSlotDef[];
}

export interface SceneSlotDef {
  id: string;
  label: string;
}

export interface CharacterDef {
  id: string;
  assetId: AssetId;
  label: string;
}

export interface Ending {
  id: string;
  type: "correct" | "incorrect";
  title: string;
  description: string;
  imageAssetId?: AssetId;
}

export interface ExpectedSolution {
  scenes: Record<string, string>; // sceneSlotId -> sceneId
  characters: Record<string, string>; // charSlotId -> characterId
  correctEndingId: string;
}

export interface Level {
  id: string;
  title: string;
  narrative: string;
  sceneSlots: SceneSlotDef[];
  scenes: SceneDef[];
  characters: CharacterDef[];
  expected: ExpectedSolution;
  endings: Ending[];
}

export interface SceneSlotState {
  sceneId: string | null;
  characters: Record<string, string | null>;
}

export type BoardState = Record<string, SceneSlotState>;

export type BoardAction =
  | {
      type: "PLACE_SCENE";
      sceneSlotId: string;
      sceneId: string;
      characterSlotIds: string[];
    }
  | {
      type: "PLACE_CHARACTER";
      sceneSlotId: string;
      charSlotId: string;
      characterId: string;
    }
  | { type: "RESET_LEVEL"; level: Level }
  | { type: "LOAD_LEVEL"; level: Level };

export interface ValidationResult {
  correct: boolean;
  endingId: string;
}
