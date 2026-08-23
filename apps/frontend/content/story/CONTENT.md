# Story content format

Each chapter is a Markdown file in this folder. The build script reads every `.md` file, validates the frontmatter, and generates `src/game/levels.generated.ts`.

## File name

Use `chapter-{N}.md`. Files are sorted by the `order` field first, then by filename.

## Structure

```markdown
---
id: level-1
title: "El saludo de Mairin"
order: 1
sceneSlots:
  - id: slot-scene-1
    label: Aula
scenes:
  - id: scene:classroom
    assetId: scene:classroom
    label: Aula
    characterSlots:
      - id: char-slot-1
        anchorX: 25
        anchorY: 55
characters:
  - id: char:mairin
    assetId: char:mairin
    label: Mairin
expected:
  scenes:
    slot-scene-1: scene:classroom
  characters:
    char-slot-1: char:mairin
  correctEndingId: ending:correct-1
endings:
  - id: ending:correct-1
    type: correct
    title: "¡Muy bien!"
    description: "..."
    imageAssetId: ending:correct-1
  - id: ending:incorrect-1
    type: incorrect
    title: "Inténtalo de nuevo"
    description: "..."
    imageAssetId: ending:incorrect-1
---

Mairin llega al aula. Reconstruye la escena colocando el salón y los personajes que muestran respeto.
```

## Field reference

| Field | Required | Description |
|---|---|---|
| `id` | yes | Unique level identifier. |
| `title` | yes | Chapter title shown in the chapter select and header. |
| `order` | yes | Integer that determines chapter order. |
| `sceneSlots` | yes | Drop zones for scenes. Usually one per level. |
| `scenes` | yes | Available scenes, their slots, and character anchor positions (0–100). |
| `characters` | yes | Draggable characters for this level. |
| `expected` | yes | Correct solution: which scene goes in each slot, which character goes in each slot, and the correct ending id. |
| `endings` | yes | Exactly one `correct` ending and at least one `incorrect` ending. |

## Asset ids

Asset ids must use one of these prefixes. The build script maps each id to a file in `public/images/`.

| Prefix | Aspect ratio | Example | File |
|---|---|---|---|
| `scene:` | 16:9 | `scene:park` | `public/images/scene-park.svg` |
| `char:` | 1:1 | `char:mairin` | `public/images/char-mairin.svg` |
| `ending:` | 1:1 | `ending:correct-1` | `public/images/ending-correct-1.svg` |

Add the matching SVG file before running `pnpm run build:levels`. The script runs in strict mode and fails if any referenced image is missing.

## Body text

Everything after the closing `---` becomes the level narrative. Keep it concise; it appears in the game header.

## How to add a chapter

1. Copy `chapter-1.md` to `chapter-N.md`.
2. Update `id`, `title`, and `order`.
3. Add or reuse scenes, characters, and endings with valid asset ids.
4. Make sure `expected.characters` keys match the `characterSlots` ids in the expected scene.
5. Add any new SVG files to `public/images/`.
6. Run `pnpm --filter frontend run build:levels` and commit the regenerated `levels.generated.ts`.

# Intro format

The intro sequence is defined in `intro.md`. The build script reads this file, validates the frontmatter, and generates `src/game/intro.generated.ts`.

## Structure

```markdown
---
items:
  - text: "La vida de las personas se divide en momentos clave que guardamos en cuadros"
    image: /images/intro-1.svg
  - text: "Cuando un cuadro se rompe, la historia se desmorona"
    image: /images/intro-2.svg
  - text: "Quieres ayudarnos a reconstruir esta historia?"
    image: /images/intro-3.svg
  - text: "Arrastra cada elemento adonde pertenece"
    image: /images/intro-4.svg
---

Optional narrative body.
```

## Field reference

| Field | Required | Description |
|---|---|---|
| `items` | yes | Non-empty array of intro slides. |
| `items[].text` | yes | Phrase shown on the slide. |
| `items[].image` | yes | Path to an SVG in `public/images/`. Must be unique across items and end in `.svg`. |

## Images

Each `image` value must point to an existing SVG file in `public/images/`. The path in the frontmatter is preserved as the runtime `src`, so use the public URL form `/images/intro-N.svg`.

## How to edit the intro

1. Open `content/story/intro.md`.
2. Edit the `text` of any item, or add/remove/reorder items.
3. Ensure every `image` references an existing `public/images/*.svg` file.
4. Keep all `image` values unique.
5. Run `pnpm --filter frontend run build:levels` and commit the regenerated `intro.generated.ts`.
