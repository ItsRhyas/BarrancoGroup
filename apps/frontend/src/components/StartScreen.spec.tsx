import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StartScreen } from "./StartScreen";

describe("StartScreen", () => {
  it("renders both action buttons", () => {
    render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={0} />,
    );
    expect(screen.getByRole("button", { name: /Nuevo juego/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continuar/i })).toBeTruthy();
  });

  it("disables Continuar when there is no resume target", () => {
    render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={null} />,
    );
    expect(
      (screen.getByRole("button", { name: /Continuar/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("enables Continuar when a resume target exists", () => {
    render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={1} />,
    );
    expect(
      (screen.getByRole("button", { name: /Continuar/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("calls the provided callbacks when buttons are clicked", () => {
    const onNewGame = vi.fn();
    const onContinue = vi.fn();
    render(
      <StartScreen
        onNewGame={onNewGame}
        onContinue={onContinue}
        resumeTarget={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    expect(onNewGame).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
