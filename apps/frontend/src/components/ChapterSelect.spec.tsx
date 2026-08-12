import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChapterSelect } from "./ChapterSelect";
import { levels } from "../game/levels";

describe("ChapterSelect", () => {
  it("renders one card for each level", () => {
    render(<ChapterSelect onSelectChapter={vi.fn()} />);
    const cards = screen.getAllByRole("button", {
      name: /El saludo de Mairin|Un juego para todos/i,
    });
    expect(cards.length).toBe(levels.length);
  });

  it("calls onSelectChapter with the index of the clicked card", () => {
    const onSelectChapter = vi.fn();
    render(<ChapterSelect onSelectChapter={onSelectChapter} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Un juego para todos/i }),
    );
    expect(onSelectChapter).toHaveBeenCalledWith(1);
  });
});
