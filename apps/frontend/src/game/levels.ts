import type { Level } from "./types";

/**
 * Level definitions for the game.
 *
 * Each level is a plain data object. The engine reads the array and renders
 * the board, draggables, and endings generically. To add a new level, append
 * another object to this array; no component code needs to change.
 *
 * Schema notes:
 * - `sceneSlots`: every scene slot must be filled before validation runs.
 * - `scenes[].characterSlots`: define where characters can be dropped inside
 *   the scene. Anchor values are percentages relative to the scene asset.
 * - `expected.scenes`: maps sceneSlotId -> sceneId for the correct answer.
 * - `expected.characters`: maps characterSlotId -> characterId for the correct
 *   answer. Character slot ids must be unique across the whole level.
 * - `endings`: exactly one ending with `type: "correct"` is required; at
 *   least one ending with `type: "incorrect"` is required.
 */
export const levels: Level[] = [
  {
    id: "level-1",
    title: "El saludo de Mairin",
    narrative:
      "Mairin llega al aula. Reconstruye la escena colocando el salón y los personajes que muestran respeto.",
    sceneSlots: [{ id: "slot-scene-1", label: "Aula" }],
    scenes: [
      {
        id: "scene:classroom",
        assetId: "scene:classroom",
        label: "Aula",
        characterSlots: [
          { id: "char-slot-1", anchorX: 25, anchorY: 55 },
          { id: "char-slot-2", anchorX: 75, anchorY: 55 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:teacher", assetId: "char:teacher", label: "Maestro" },
      { id: "char:peer", assetId: "char:peer", label: "Compañero" },
    ],
    expected: {
      scenes: { "slot-scene-1": "scene:classroom" },
      characters: {
        "char-slot-1": "char:mairin",
        "char-slot-2": "char:teacher",
      },
      correctEndingId: "ending:correct-1",
    },
    endings: [
      {
        id: "ending:correct-1",
        type: "correct",
        title: "¡Muy bien!",
        description:
          "Mairin saludó al maestro con respeto. El aula se llenó de armonía y todos aprendieron juntos.",
      },
      {
        id: "ending:incorrect-1",
        type: "incorrect",
        title: "Inténtalo de nuevo",
        description:
          "La escena no refleja respeto. Piensa en quién debería estar junto a Mairin en el aula.",
      },
    ],
  },
  {
    id: "level-2",
    title: "Un juego para todos",
    narrative:
      "En el parque, Mairin quiere que todos puedan jugar. Coloca la escena y los personajes que muestran equidad.",
    sceneSlots: [{ id: "slot-scene-2", label: "Parque" }],
    scenes: [
      {
        id: "scene:park",
        assetId: "scene:park",
        label: "Parque",
        characterSlots: [
          { id: "char-slot-a", anchorX: 20, anchorY: 60 },
          { id: "char-slot-b", anchorX: 50, anchorY: 60 },
          { id: "char-slot-c", anchorX: 80, anchorY: 60 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:friend-wheelchair", assetId: "char:friend-wheelchair", label: "Amigo con silla" },
      { id: "char:friend-bench", assetId: "char:friend-bench", label: "Amigo en la banca" },
    ],
    expected: {
      scenes: { "slot-scene-2": "scene:park" },
      characters: {
        "char-slot-a": "char:mairin",
        "char-slot-b": "char:friend-wheelchair",
        "char-slot-c": "char:friend-bench",
      },
      correctEndingId: "ending:correct-2",
    },
    endings: [
      {
        id: "ending:correct-2",
        type: "correct",
        title: "¡Equidad en acción!",
        description:
          "Mairin adaptó el juego para que su amigo con silla de ruedas también participara. Jugar juntos es más divertido cuando todos tienen lugar.",
      },
      {
        id: "ending:incorrect-2",
        type: "incorrect",
        title: "Inténtalo de nuevo",
        description:
          "La escena no muestra equidad. Recuerda: todos merecen participar, incluso si necesitamos adaptar el juego.",
      },
    ],
  },
];
