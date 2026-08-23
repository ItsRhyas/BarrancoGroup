import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildLevels } from "./build-levels.ts";

const repoRoot = path.resolve(import.meta.dirname, "..");
const realStoryDir = path.join(repoRoot, "content", "story");
const realImagesDir = path.join(repoRoot, "public", "images");
const realOutPath = path.join(repoRoot, "src", "game", "levels.generated.ts");
const committedGenerated = fs.readFileSync(realOutPath, "utf-8");

interface ChapterFixture {
  id: string;
  sceneAssetId?: string;
  characterAssetId?: string;
  correctEndingAssetId?: string;
  incorrectEndingAssetId?: string;
  anchorX?: number;
  extraExpectedCharSlot?: string;
  unrecognizedAssetId?: string;
}

function chapterMarkdown(fixture: ChapterFixture = {}): string {
  const sceneAssetId = fixture.sceneAssetId ?? "scene:test";
  const characterAssetId = fixture.characterAssetId ?? "char:test";
  const correctEndingAssetId =
    fixture.correctEndingAssetId ?? "ending:correct-test";
  const incorrectEndingAssetId =
    fixture.incorrectEndingAssetId ?? "ending:incorrect-test";
  const anchorX = fixture.anchorX ?? 50;
  const expectedChars: Record<string, string> = {
    "char-slot-1": "char:test",
  };
  if (fixture.extraExpectedCharSlot) {
    expectedChars[fixture.extraExpectedCharSlot] = "char:test";
  }

  const frontmatter = {
    id: fixture.id,
    title: "Test Chapter",
    order: 1,
    sceneSlots: [{ id: "slot-1", label: "Slot" }],
    scenes: [
      {
        id: sceneAssetId,
        assetId: fixture.unrecognizedAssetId ?? sceneAssetId,
        label: "Scene",
        characterSlots: [{ id: "char-slot-1", anchorX, anchorY: 50 }],
      },
    ],
    characters: [
      {
        id: characterAssetId,
        assetId: fixture.unrecognizedAssetId ?? characterAssetId,
        label: "Character",
      },
    ],
    expected: {
      scenes: { "slot-1": sceneAssetId },
      characters: expectedChars,
      correctEndingId: correctEndingAssetId,
    },
    endings: [
      {
        id: correctEndingAssetId,
        type: "correct",
        title: "Correct",
        description: "Correct ending",
        imageAssetId: correctEndingAssetId,
      },
      {
        id: incorrectEndingAssetId,
        type: "incorrect",
        title: "Incorrect",
        description: "Incorrect ending",
        imageAssetId: incorrectEndingAssetId,
      },
    ],
  };

  return `---\n${JSON.stringify(frontmatter)}\n---\n\nTest narrative.\n`;
}

function makeTempDirs(): {
  root: string;
  storyDir: string;
  imagesDir: string;
  outPath: string;
} {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "build-levels-"));
  const storyDir = path.join(root, "content", "story");
  const imagesDir = path.join(root, "public", "images");
  const outPath = path.join(root, "levels.generated.ts");
  fs.mkdirSync(storyDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
  return { root, storyDir, imagesDir, outPath };
}

describe("buildLevels happy path", () => {
  it("parses current chapters and emits five levels with thirty-three assets", () => {
    const output = buildLevels({
      storyDir: realStoryDir,
      imagesDir: realImagesDir,
      outPath: realOutPath,
      strictImages: true,
    });
    expect(output).toContain('id: "level-1"');
    expect(output).toContain('id: "level-5"');
    expect(output).toContain("scene:classroom");
    expect(output).toContain("scene:park");
    expect(output.match(/type: "image"/g)?.length ?? 0).toBeGreaterThanOrEqual(33);
  });

  it("produces output identical to the committed generated file", () => {
    const output = buildLevels({
      storyDir: realStoryDir,
      imagesDir: realImagesDir,
      outPath: realOutPath,
      strictImages: true,
    });
    expect(output).toBe(committedGenerated);
  });

  it("is idempotent across two runs", () => {
    const first = buildLevels({
      storyDir: realStoryDir,
      imagesDir: realImagesDir,
      outPath: realOutPath,
      strictImages: true,
    });
    const second = buildLevels({
      storyDir: realStoryDir,
      imagesDir: realImagesDir,
      outPath: realOutPath,
      strictImages: true,
    });
    expect(second).toBe(first);
    expect(fs.readFileSync(realOutPath, "utf-8")).toBe(first);
  });

  it("serializes iconAssetId and sceneAssetId and registers icon assets as 1:1", () => {
    const { storyDir, imagesDir, outPath } = makeTempDirs();
    const frontmatter = {
      id: "level-icon-model",
      title: "Icon Model Test",
      order: 1,
      sceneSlots: [{ id: "slot-1", label: "Slot" }],
      scenes: [
        {
          id: "scene:test",
          assetId: "scene:test",
          label: "Scene",
          iconAssetId: "scene:test-icon",
          sceneAssetId: "scene:test-full",
          characterSlots: [{ id: "char-slot-1", anchorX: 50, anchorY: 50 }],
        },
      ],
      characters: [
        {
          id: "char:test",
          assetId: "char:test",
          label: "Character",
          iconAssetId: "char:test-icon",
          sceneAssetId: "char:test-scene",
        },
      ],
      expected: {
        scenes: { "slot-1": "scene:test" },
        characters: { "char-slot-1": "char:test" },
        correctEndingId: "ending:correct-icon",
      },
      endings: [
        {
          id: "ending:correct-icon",
          type: "correct",
          title: "Correct",
          description: "Correct ending",
          imageAssetId: "ending:correct-icon",
        },
        {
          id: "ending:incorrect-icon",
          type: "incorrect",
          title: "Incorrect",
          description: "Incorrect ending",
          imageAssetId: "ending:incorrect-icon",
        },
      ],
    };

    fs.writeFileSync(
      path.join(storyDir, "chapter-icon-model.md"),
      `---\n${JSON.stringify(frontmatter)}\n---\n\nTest narrative.\n`,
      "utf-8",
    );

    const assetIds = [
      "scene:test",
      "scene:test-icon",
      "scene:test-full",
      "char:test",
      "char:test-icon",
      "char:test-scene",
      "ending:correct-icon",
      "ending:incorrect-icon",
    ];
    for (const assetId of assetIds) {
      fs.writeFileSync(
        path.join(imagesDir, `${assetId.replace(/:/g, "-")}.svg`),
        "<svg/>",
        "utf-8",
      );
    }

    const output = buildLevels({
      storyDir,
      imagesDir,
      outPath,
      strictImages: true,
    });

    expect(output).toContain('iconAssetId: "scene:test-icon"');
    expect(output).toContain('sceneAssetId: "scene:test-full"');
    expect(output).toContain('iconAssetId: "char:test-icon"');
    expect(output).toContain('sceneAssetId: "char:test-scene"');

    // scene:test-icon uses a scene: prefix but is registered as a 1:1 icon.
    const iconBlock = output.match(
      /"scene:test-icon": \{[\s\S]*?\},/,
    )?.[0];
    expect(iconBlock).toBeDefined();
    expect(iconBlock).toContain("aspectRatio: 1");
  });
});

describe("buildLevels failure modes", () => {
  it("fails in strict mode when a referenced SVG is missing", () => {
    const { storyDir, imagesDir, outPath } = makeTempDirs();
    fs.writeFileSync(
      path.join(storyDir, "chapter-test.md"),
      chapterMarkdown({ id: "level-missing-svg" }),
      "utf-8",
    );

    expect(() =>
      buildLevels({
        storyDir,
        imagesDir,
        outPath,
        strictImages: true,
      }),
    ).toThrow("missing image files");
  });

  it("fails when an assetId uses an unrecognized prefix", () => {
    const { storyDir, imagesDir, outPath } = makeTempDirs();
    fs.writeFileSync(
      path.join(storyDir, "chapter-test.md"),
      chapterMarkdown({
        id: "level-bad-prefix",
        unrecognizedAssetId: "unknown:asset",
      }),
      "utf-8",
    );

    expect(() =>
      buildLevels({
        storyDir,
        imagesDir,
        outPath,
        strictImages: true,
      }),
    ).toThrow("unrecognized prefix");
  });

  it("fails when expected character slots do not match scene slots", () => {
    const { storyDir, imagesDir, outPath } = makeTempDirs();
    fs.writeFileSync(
      path.join(storyDir, "chapter-test.md"),
      chapterMarkdown({
        id: "level-broken-slots",
        extraExpectedCharSlot: "char-slot-missing",
      }),
      "utf-8",
    );

    expect(() =>
      buildLevels({
        storyDir,
        imagesDir,
        outPath,
        strictImages: true,
      }),
    ).toThrow("references unknown character slot");
  });

  it("fails when a character anchor is out of range", () => {
    const { storyDir, imagesDir, outPath } = makeTempDirs();
    fs.writeFileSync(
      path.join(storyDir, "chapter-test.md"),
      chapterMarkdown({ id: "level-bad-anchor", anchorX: 150 }),
      "utf-8",
    );

    expect(() =>
      buildLevels({
        storyDir,
        imagesDir,
        outPath,
        strictImages: true,
      }),
    ).toThrow("anchorX");
  });
});
