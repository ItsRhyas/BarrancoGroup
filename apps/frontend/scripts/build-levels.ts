/* global console process */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { chapterSchema } from "./build-levels.schema.ts";
import type { AssetEntry, AssetRegistry, Level } from "../src/game/types.ts";

export interface BuildOptions {
  storyDir: string;
  imagesDir: string;
  outPath: string;
  strictImages: boolean;
}

export class BuildError extends Error {
  code: number;

  constructor(message: string, code = 1) {
    super(message);
    this.name = "BuildError";
    this.code = code;
  }
}

function fail(message: string, code = 1): never {
  throw new BuildError(message, code);
}

function warn(message: string): void {
  console.warn(message);
}

function assetIdToFilename(assetId: string): string {
  return `${assetId.replace(/:/g, "-")}.svg`;
}

function assetIdToSrc(assetId: string): string {
  return `/images/${assetIdToFilename(assetId)}`;
}

function inferAssetEntry(assetId: string): AssetEntry {
  const src = assetIdToSrc(assetId);
  if (assetId.startsWith("scene:")) {
    return { type: "image", src, aspectRatio: 16 / 9 };
  }
  if (assetId.startsWith("char:")) {
    return { type: "image", src, aspectRatio: 1 };
  }
  if (assetId.startsWith("ending:")) {
    return { type: "image", src, aspectRatio: 1 };
  }
  throw new Error(
    `Unrecognized assetId prefix for "${assetId}" (expected scene:, char:, or ending:)`,
  );
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

function serializeRecord(
  record: Record<string, string>,
  indent: string,
): string {
  const keys = Object.keys(record).sort((a, b) => a.localeCompare(b));
  if (keys.length === 0) {
    return "{}";
  }
  const lines = keys.map(
    (key) => `${indent}  ${tsString(key)}: ${tsString(record[key])},`,
  );
  return `{\n${lines.join("\n")}\n${indent}}`;
}

function serializeAssetRegistry(registry: AssetRegistry): string {
  const keys = Object.keys(registry).sort((a, b) => a.localeCompare(b));
  const lines: string[] = ["{"];
  for (const key of keys) {
    const entry = registry[key];
    lines.push(`  ${tsString(key)}: {`);
    if (entry.type === "image") {
      lines.push(`    type: "image",`);
      lines.push(`    src: ${tsString(entry.src)},`);
      lines.push(`    aspectRatio: ${entry.aspectRatio ?? 1},`);
    } else {
      lines.push(`    type: "emoji",`);
      lines.push(`    emoji: ${tsString(entry.emoji)},`);
      if (entry.aspectRatio) {
        lines.push(`    aspectRatio: ${entry.aspectRatio},`);
      }
    }
    lines.push(`  },`);
  }
  lines.push("}");
  return lines.join("\n");
}

function serializeLevel(level: Level): string {
  const lines: string[] = [];
  lines.push(`  {`);
  lines.push(`    id: ${tsString(level.id)},`);
  lines.push(`    title: ${tsString(level.title)},`);
  lines.push(`    narrative: ${tsString(level.narrative)},`);

  lines.push(`    sceneSlots: [`);
  for (const slot of level.sceneSlots) {
    lines.push(`      { id: ${tsString(slot.id)}, label: ${tsString(slot.label)} },`);
  }
  lines.push(`    ],`);

  lines.push(`    scenes: [`);
  for (const scene of level.scenes) {
    lines.push(`      {`);
    lines.push(`        id: ${tsString(scene.id)},`);
    lines.push(`        assetId: ${tsString(scene.assetId)},`);
    lines.push(`        label: ${tsString(scene.label)},`);
    lines.push(`        characterSlots: [`);
    for (const slot of scene.characterSlots) {
      lines.push(
        `          { id: ${tsString(slot.id)}, anchorX: ${slot.anchorX}, anchorY: ${slot.anchorY} },`,
      );
    }
    lines.push(`        ],`);
    lines.push(`      },`);
  }
  lines.push(`    ],`);

  lines.push(`    characters: [`);
  for (const character of level.characters) {
    lines.push(
      `      { id: ${tsString(character.id)}, assetId: ${tsString(character.assetId)}, label: ${tsString(character.label)} },`,
    );
  }
  lines.push(`    ],`);

  lines.push(`    expected: {`);
  lines.push(`      scenes: ${serializeRecord(level.expected.scenes, "      ")},`);
  lines.push(
    `      characters: ${serializeRecord(level.expected.characters, "      ")},`,
  );
  lines.push(`      correctEndingId: ${tsString(level.expected.correctEndingId)},`);
  lines.push(`    },`);

  lines.push(`    endings: [`);
  for (const ending of level.endings) {
    lines.push(`      {`);
    lines.push(`        id: ${tsString(ending.id)},`);
    lines.push(`        type: ${tsString(ending.type)},`);
    lines.push(`        title: ${tsString(ending.title)},`);
    lines.push(`        description: ${tsString(ending.description)},`);
    if (ending.imageAssetId) {
      lines.push(`        imageAssetId: ${tsString(ending.imageAssetId)},`);
    }
    lines.push(`      },`);
  }
  lines.push(`    ],`);
  lines.push(`  },`);
  return lines.join("\n");
}

function collectAssetIds(level: Level): Set<string> {
  const ids = new Set<string>();
  for (const scene of level.scenes) {
    ids.add(scene.assetId);
  }
  for (const character of level.characters) {
    ids.add(character.assetId);
  }
  for (const ending of level.endings) {
    if (ending.imageAssetId) {
      ids.add(ending.imageAssetId);
    }
  }
  return ids;
}

function validateLevel(level: Level, source: string): void {
  const seenCharSlotIds = new Set<string>();
  for (const scene of level.scenes) {
    for (const slot of scene.characterSlots) {
      if (seenCharSlotIds.has(slot.id)) {
        fail(
          `${source}: duplicate character slot id "${slot.id}" across scenes`,
        );
      }
      seenCharSlotIds.add(slot.id);
    }
  }

  for (const [sceneSlotId, sceneId] of Object.entries(level.expected.scenes)) {
    const scene = level.scenes.find((s) => s.id === sceneId);
    if (!scene) {
      fail(
        `${source}: expected.scenes references unknown scene "${sceneId}" for slot "${sceneSlotId}"`,
      );
    }

    const sceneCharSlotIds = new Set(
      scene.characterSlots.map((slot) => slot.id),
    );
    const expectedCharSlotIds = new Set(
      Object.entries(level.expected.characters)
        .filter(
          ([charSlotId, characterId]) =>
            sceneCharSlotIds.has(charSlotId) &&
            level.characters.some((c) => c.id === characterId),
        )
        .map(([charSlotId]) => charSlotId),
    );

    const sortedExpected = [...expectedCharSlotIds].sort((a, b) =>
      a.localeCompare(b),
    );
    const sortedScene = [...sceneCharSlotIds].sort((a, b) =>
      a.localeCompare(b),
    );
    if (
      sortedExpected.length !== sortedScene.length ||
      sortedExpected.some((id, index) => id !== sortedScene[index])
    ) {
      fail(
        `${source}: expected scene "${sceneId}" character slots [${sortedScene.join(
          ", ",
        )}] do not match expected.characters keys [${sortedExpected.join(", ")}]`,
      );
    }
  }

  for (const charSlotId of Object.keys(level.expected.characters)) {
    const exists = level.scenes.some((scene) =>
      scene.characterSlots.some((slot) => slot.id === charSlotId),
    );
    if (!exists) {
      fail(
        `${source}: expected.characters references unknown character slot "${charSlotId}"`,
      );
    }
  }

  for (const [charSlotId, characterId] of Object.entries(
    level.expected.characters,
  )) {
    if (!level.characters.some((c) => c.id === characterId)) {
      fail(
        `${source}: expected.characters["${charSlotId}"] references unknown character "${characterId}"`,
      );
    }
  }

  const correctEnding = level.endings.find((e) => e.type === "correct");
  if (!correctEnding) {
    fail(`${source}: missing correct ending`);
  }
  if (!correctEnding.imageAssetId) {
    fail(
      `${source}: correct ending "${correctEnding.id}" must have imageAssetId`,
    );
  }

  for (const assetId of collectAssetIds(level)) {
    if (
      !assetId.startsWith("scene:") &&
      !assetId.startsWith("char:") &&
      !assetId.startsWith("ending:")
    ) {
      fail(
        `${source}: asset id "${assetId}" uses unrecognized prefix (expected scene:, char:, or ending:)`,
      );
    }
  }
}

function checkImageFiles(
  assetIds: Iterable<string>,
  imagesDir: string,
  strictImages: boolean,
): void {
  const missing = new Set<string>();
  for (const assetId of assetIds) {
    const filePath = path.join(imagesDir, assetIdToFilename(assetId));
    if (!fs.existsSync(filePath)) {
      missing.add(filePath);
    }
  }
  if (missing.size === 0) {
    return;
  }

  const sorted = [...missing].sort((a, b) => a.localeCompare(b));
  if (strictImages) {
    fail(
      `build: missing image files:\n${sorted.map((f) => `  - ${f}`).join("\n")}`,
    );
  }
  warn(
    `build: ${missing.size} referenced image file(s) are missing; pass --strict-images to fail. Missing:\n${sorted
      .map((f) => `  - ${f}`)
      .join("\n")}`,
  );
}

function buildAssetRegistry(levels: Level[]): AssetRegistry {
  const registry: AssetRegistry = {};
  for (const level of levels) {
    for (const assetId of collectAssetIds(level)) {
      registry[assetId] = inferAssetEntry(assetId);
    }
  }
  return registry;
}

function readChapter(
  file: string,
  storyDir: string,
): { order: number; level: Level } {
  const filePath = path.join(storyDir, file);
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    fail(`${file}: unable to read file (${cause})`, 2);
  }

  const parsed = matter(raw);
  const frontmatter = chapterSchema.safeParse(parsed.data);
  if (!frontmatter.success) {
    fail(`${file}: ${frontmatter.error.message}`);
  }

  const narrative = parsed.content.trim();
  if (narrative.length === 0) {
    fail(`${file}: narrative body is empty`);
  }

  const chapter = frontmatter.data;
  const level: Level = {
    id: chapter.id,
    title: chapter.title,
    narrative,
    sceneSlots: chapter.sceneSlots,
    scenes: chapter.scenes,
    characters: chapter.characters,
    expected: chapter.expected,
    endings: chapter.endings,
  };

  return { order: chapter.order ?? 0, level };
}

export function buildLevels(options: BuildOptions): string {
  const { storyDir, imagesDir, outPath, strictImages } = options;

  if (!fs.existsSync(storyDir)) {
    fail(`Story directory not found: ${storyDir}`, 2);
  }

  const files = fs
    .readdirSync(storyDir)
    .filter((file) => file.startsWith("chapter-") && file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    fail(`No markdown files found in ${storyDir}`, 2);
  }

  const chapters = files.map((file) => {
    const { order, level } = readChapter(file, storyDir);
    return { source: file, order, level };
  });

  chapters.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.level.id.localeCompare(b.level.id);
  });

  const levels = chapters.map((chapter) => chapter.level);
  for (const chapter of chapters) {
    validateLevel(chapter.level, chapter.source);
  }

  const registry = buildAssetRegistry(levels);
  checkImageFiles(Object.keys(registry), imagesDir, strictImages);

  const serializedLevels = levels.map(serializeLevel).join("\n");
  const output =
    `// This file is generated by scripts/build-levels.ts. Do not edit manually.\n` +
    `import type { Level, AssetRegistry } from "./types";\n\n` +
    `export const levels: Level[] = [\n${serializedLevels}\n];\n\n` +
    `export const assetRegistry: AssetRegistry = ${serializeAssetRegistry(registry)};\n`;

  try {
    fs.writeFileSync(outPath, output, "utf-8");
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    fail(`Unable to write ${outPath} (${cause})`, 2);
  }

  console.log(
    `Generated ${outPath} (${levels.length} levels, ${Object.keys(registry).length} assets)`,
  );
  return output;
}

function main(): void {
  const strictImages = process.argv.includes("--strict-images");
  const root = path.resolve(import.meta.dirname, "..");
  try {
    buildLevels({
      storyDir: path.join(root, "content", "story"),
      imagesDir: path.join(root, "public", "images"),
      outPath: path.join(root, "src", "game", "levels.generated.ts"),
      strictImages,
    });
  } catch (error) {
    if (error instanceof BuildError) {
      console.error(error.message);
      process.exit(error.code);
    }
    throw error;
  }
}

main();
