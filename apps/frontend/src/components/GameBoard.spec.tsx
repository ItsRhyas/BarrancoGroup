import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { GameBoard } from "./GameBoard";
import { levels } from "../game/levels";

describe("GameBoard", () => {
  const level = levels[0];

  function renderGameBoard() {
    return render(
      <GameBoard
        levelIndex={0}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onChapterCompleted={vi.fn()}
      />,
    );
  }

  it("renders the title, context, and narrative in order", () => {
    renderGameBoard();

    const header = document.querySelector(".game-header");
    expect(header).toBeTruthy();

    const title = header?.querySelector("h1");
    const context = header?.querySelector(".game-context");
    const narrative = header?.querySelector(".game-narrative");

    expect(title).toBeTruthy();
    expect(context).toBeTruthy();
    expect(narrative).toBeTruthy();

    expect(title?.textContent).toBe(level.title);
    expect(context?.textContent).toBe(level.context);
    expect(narrative?.textContent).toBe(level.narrative);

    const children = Array.from(header?.children ?? []);
    const titleIndex = title ? children.indexOf(title) : -1;
    const contextIndex = context ? children.indexOf(context) : -1;
    const narrativeIndex = narrative ? children.indexOf(narrative) : -1;

    expect(titleIndex).toBe(0);
    expect(contextIndex).toBe(1);
    expect(narrativeIndex).toBe(2);
  });
});
