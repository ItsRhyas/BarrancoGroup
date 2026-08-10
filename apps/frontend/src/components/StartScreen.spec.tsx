import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StartScreen } from "./StartScreen";

describe("StartScreen", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders both action buttons", () => {
    render(<StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Nuevo juego/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continuar/i })).toBeTruthy();
  });

  it("disables Continuar when there is no saved chapter", () => {
    render(<StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} />);
    expect(
      (screen.getByRole("button", { name: /Continuar/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("enables Continuar when a saved chapter exists", () => {
    sessionStorage.setItem("mairin:lastChapter", "0");
    render(<StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} />);
    expect(
      (screen.getByRole("button", { name: /Continuar/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("calls the provided callbacks when buttons are clicked", () => {
    const onNewGame = vi.fn();
    const onContinue = vi.fn();
    sessionStorage.setItem("mairin:lastChapter", "0");
    render(<StartScreen onNewGame={onNewGame} onContinue={onContinue} />);

    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    expect(onNewGame).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
