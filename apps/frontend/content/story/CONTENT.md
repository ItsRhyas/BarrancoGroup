# Story content format

Chapters and the intro are JSON files in this folder. The build script (`scripts/build-levels.ts`) reads them with `JSON.parse`, validates them against zod schemas, and generates:

- `src/game/levels.generated.ts`
- `src/game/intro.generated.ts`

Run `pnpm --filter frontend run build:levels` (or `npm run build:levels` inside `apps/frontend`) after editing content.

## Chapter files

Use `chapter-{N}.json` (for example, `chapter-1.json`). Files are discovered automatically and sorted by the `order` field first, then by filename.

### Structure

```json
{
  "id": "level-1",
  "title": "El saludo de Mairin",
  "order": 1,
  "context": "Mairin es una estudiante nueva...",
  "narrative": "Mairin llega al aula...",
  "sceneSlots": [
    { "id": "slot-scene-1", "label": "Aula" }
  ],
  "scenes": [
    {
      "id": "scene:classroom",
      "assetId": "scene:classroom",
      "label": "Aula",
      "characterSlots": [
        { "id": "char-slot-1", "anchorX": 25, "anchorY": 55 }
      ]
    }
  ],
  "characters": [
    { "id": "char:mairin", "assetId": "char:mairin", "label": "Mairin" }
  ],
  "expected": {
    "scenes": { "slot-scene-1": "scene:classroom" },
    "characters": { "char-slot-1": "char:mairin" },
    "correctEndingId": "ending:correct-1"
  },
  "endings": [
    {
      "id": "ending:correct-1",
      "type": "correct",
      "title": "¡Muy bien!",
      "description": "...",
      "imageAssetId": "ending:correct-1"
    },
    {
      "id": "ending:incorrect-1",
      "type": "incorrect",
      "title": "Inténtalo de nuevo",
      "description": "...",
      "imageAssetId": "ending:incorrect-1"
    }
  ]
}
```

### Field reference

| Field | Required | Description |
|---|---|---|
| `id` | yes | Unique level identifier. |
| `title` | yes | Chapter title shown in the chapter select and header. |
| `order` | yes | Integer that determines chapter order. |
| `context` | yes | 1–3 sentence self-contained backstory that explains who Mairin is, the situation, and the value at stake. Rendered in the game header (PR4). |
| `narrative` | yes | Short instruction shown to the player. Rendered in the game header (PR4). |
| `sceneSlots` | yes | Drop zones for scenes. Usually one per level, but later levels use more. |
| `scenes` | yes | Available scenes, their slots, and character anchor positions (`0–100`). |
| `characters` | yes | Draggable characters for this level. |
| `expected` | yes | Correct solution: which scene goes in each slot, which character goes in each slot, and the correct ending id. |
| `endings` | yes | Exactly one `correct` ending and at least one `incorrect` ending. |

### Scene-count constraints

The current story arc uses these counts:

| Chapter | Scenes |
|---|---|
| 1 | 1 |
| 2–3 | 2 |
| 4–5 | 3 |

### Asset ids

Asset ids must use one of these prefixes. The build script maps each id to a file in `public/images/`.

| Prefix | Aspect ratio | Example | File |
|---|---|---|---|
| `scene:` | 16:9 | `scene:park` | `public/images/scene-park.svg` |
| `char:` | 1:1 | `char:mairin` | `public/images/char-mairin.svg` |
| `ending:` | 1:1 | `ending:correct-1` | `public/images/ending-correct-1.svg` |

Add the matching SVG file before running the build. The script runs in strict mode and fails if any referenced image is missing.

### How to add a chapter

1. Copy `chapter-1.json` to `chapter-N.json`.
2. Update `id`, `title`, and `order`.
3. Write a `context` and `narrative` in Spanish.
4. Add or reuse scenes, characters, and endings with valid asset ids.
5. Make sure `expected.characters` keys match the `characterSlots` ids in the expected scene.
6. Add any new SVG files to `public/images/`.
7. Run `pnpm --filter frontend run build:levels` and commit the regenerated `levels.generated.ts`.

### Regeneration guarantee

The serializer emits stable, sorted-key output. Regenerating `levels.generated.ts` from the committed JSON source must produce byte-identical output. The byte-identical test in `scripts/build-levels.spec.ts` enforces this.

## AI story generation prompt

For a complete, paste-ready prompt that embeds the exact chapter schema above, the asset conventions, the scene-count constraints, and the `context` requirement, see `../../story-prompt.txt` at the repository root. The prompt is written in Spanish and is intended for a story-specialized AI that generates the full five-chapter arc in one call. The `context` field requirement documented here is the same one enforced in that prompt.

## Intro file

The intro sequence is defined in `intro.json`.

### Structure

```json
{
  "items": [
    {
      "text": "La vida de las personas se divide en momentos clave...",
      "image": "/images/intro-1.svg"
    }
  ]
}
```

### Field reference

| Field | Required | Description |
|---|---|---|
| `items` | yes | Non-empty array of intro slides. |
| `items[].text` | yes | Phrase shown on the slide. |
| `items[].image` | yes | Path to an SVG in `public/images/`. Must be unique across items and end in `.svg`. |

### How to edit the intro

1. Open `content/story/intro.json`.
2. Edit the `text` of any item, or add/remove/reorder items.
3. Ensure every `image` references an existing `public/images/*.svg` file.
4. Keep all `image` values unique.
5. Run `pnpm --filter frontend run build:levels` and commit the regenerated `intro.generated.ts`.
