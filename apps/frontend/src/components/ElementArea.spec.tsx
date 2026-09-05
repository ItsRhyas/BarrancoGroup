import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { ElementArea } from "./ElementArea";
import { levels } from "../game/levels";

describe("ElementArea", () => {
  const level = levels[0];

  it("renders the rounded card wrapping the tray", () => {
    render(
      <DndContext>
        <ElementArea level={level} />
      </DndContext>,
    );
    const card = document.querySelector(".element-area-card");
    expect(card).toBeTruthy();
    expect(card?.querySelector(".element-tray")).toBeTruthy();
  });

  it("keeps the title above the card", () => {
    render(
      <DndContext>
        <ElementArea level={level} />
      </DndContext>,
    );
    const section = document.querySelector(".element-area");
    const title = section?.querySelector(".element-area-title");
    const card = section?.querySelector(".element-area-card");
    expect(title).toBeTruthy();
    expect(card).toBeTruthy();

    const children = Array.from(section?.children ?? []);
    const titleIndex = title ? children.indexOf(title) : -1;
    const cardIndex = card ? children.indexOf(card) : -1;
    expect(titleIndex).toBeGreaterThan(-1);
    expect(cardIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeLessThan(cardIndex);
  });

  it("preserves the accessible label", () => {
    render(
      <DndContext>
        <ElementArea level={level} />
      </DndContext>,
    );
    expect(screen.getByLabelText("Elementos disponibles")).toBeTruthy();
  });

  it("renders scene and character draggable items inside the tray", () => {
    render(
      <DndContext>
        <ElementArea level={level} />
      </DndContext>,
    );
    const tray = document.querySelector(".element-tray");
    expect(tray).toBeTruthy();

    for (const scene of level.scenes) {
      expect(screen.getByRole("button", { name: `Arrastrar ${scene.label}` })).toBeTruthy();
    }
    for (const character of level.characters) {
      expect(screen.getByRole("button", { name: `Arrastrar ${character.label}` })).toBeTruthy();
    }
  });
});
