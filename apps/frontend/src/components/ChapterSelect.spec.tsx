import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChapterSelect } from "./ChapterSelect";
import { levels } from "../game/levels";

describe("ChapterSelect", () => {
  it("renders the title image with an accessible name", () => {
    const { container } = render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    const title = container.querySelector(
      ".chapter-select__title",
    ) as HTMLImageElement;
    expect(title).not.toBeNull();
    expect(title.getAttribute("src")).toBe("/images/chapter_selection_title.svg");
    expect(
      screen.getByRole("img", { name: /Selección de capítulo/i }),
    ).toBeTruthy();
  });

  it("renders the decorative background image", () => {
    const { container } = render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    const bg = container.querySelector(".chapter-select__bg");
    expect(bg).not.toBeNull();
    expect(bg?.getAttribute("src")).toContain("chapter_selection.svg");
    expect(bg?.getAttribute("alt")).toBe("");
    expect(bg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders one frame button for each level", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(levels.length);
  });

  it("does not render the narrative summary", () => {
    const { container } = render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    expect(container.querySelector(".chapter-card-narrative")).toBeNull();
    expect(screen.queryByText(levels[0].narrative)).toBeNull();
  });

  it("calls onSelectChapter with the index of an unlocked frame", () => {
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

  it("locks frames that are not yet unlocked", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[]}
        totalLevels={levels.length}
      />,
    );
    const lockedFrame = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(lockedFrame.disabled).toBe(true);
    expect(lockedFrame.getAttribute("aria-disabled")).toBe("true");
    expect(lockedFrame.classList.contains("chapter-frame--locked")).toBe(true);
  });

  it("does not call onSelectChapter when a locked frame is clicked", () => {
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

  it("marks completed frames with a check indicator", () => {
    render(
      <ChapterSelect
        onSelectChapter={vi.fn()}
        completedChapters={[0]}
        totalLevels={levels.length}
      />,
    );
    const completedFrame = screen.getByRole("button", {
      name: /El saludo de Mairin/i,
    });
    expect(completedFrame.classList.contains("chapter-frame--completed")).toBe(
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
    const unlockedFrame = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(unlockedFrame.disabled).toBe(false);
  });
});
