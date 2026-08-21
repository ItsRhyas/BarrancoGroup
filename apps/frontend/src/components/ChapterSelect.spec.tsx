import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChapterSelect } from "./ChapterSelect";
import { levels } from "../game/levels";

describe("ChapterSelect", () => {
  it("renders one card for each level", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    const cards = screen.getAllByRole("button", {
      name: /El saludo de Mairin|Un juego para todos/i,
    });
    expect(cards.length).toBe(levels.length);
  });

  it("calls onSelectChapter with the index of an unlocked card", () => {
    const onSelectChapter = vi.fn();
    render(
      <ChapterSelect
        onSelectChapter={onSelectChapter}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    expect(onSelectChapter).toHaveBeenCalledWith(0);
  });

  it("locks cards that are not yet unlocked", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    const lockedCard = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(lockedCard.disabled).toBe(true);
    expect(lockedCard.getAttribute("aria-disabled")).toBe("true");
  });

  it("does not call onSelectChapter when a locked card is clicked", () => {
    const onSelectChapter = vi.fn();
    render(
      <ChapterSelect
        onSelectChapter={onSelectChapter}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Un juego para todos/i }),
    );
    expect(onSelectChapter).not.toHaveBeenCalled();
  });

  it("marks completed cards with a check indicator", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[0]}
        totalLevels={levels.length}
      />,
    );
    const completedCard = screen.getByRole("button", {
      name: /El saludo de Mairin/i,
    });
    expect(completedCard.classList.contains("chapter-card--completed")).toBe(
      true,
    );
  });

  it("unlocks the next chapter after completing the previous one", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[0]}
        totalLevels={levels.length}
      />,
    );
    const unlockedCard = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(unlockedCard.disabled).toBe(false);
  });
});
