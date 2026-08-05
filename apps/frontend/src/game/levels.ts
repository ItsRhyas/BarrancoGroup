import type { Level } from "./types";

/**
 * Level 1 — Respeto en el aula.
 * Mairin debe reconstruir una escena donde saluda al maestro con respeto.
 *
 * Adding a new level means appending one more object to this array. No
 * component code needs to change as long as the level follows the same schema.
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
];
