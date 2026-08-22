import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StartScreen } from "./StartScreen";

describe("StartScreen", () => {
  it("renders the title block", () => {
    render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={0} />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /Mairin/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 2, name: /Retratos Rotos/i }),
    ).toBeTruthy();
  });

  it("renders the background image", () => {
    const { container } = render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={0} />,
    );
    expect(container.querySelector(".start-screen__bg")).toBeTruthy();
  });

  it("renders both action buttons", () => {
    render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={0} />,
    );
    expect(screen.getByRole("button", { name: /Nuevo juego/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continuar/i })).toBeTruthy();
  });

  it("disables Continuar when there is no resume target", () => {
    render(
      <StartScreen
        onNewGame={vi.fn()}
        onContinue={vi.fn()}
        resumeTarget={null}
      />,
    );
    const continueButton = screen.getByRole("button", {
      name: /Continuar/i,
    }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);
    expect(continueButton.getAttribute("data-state")).toBe("unavailable");
  });

  it("enables Continuar when a resume target exists", () => {
    render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={1} />,
    );
    const continueButton = screen.getByRole("button", {
      name: /Continuar/i,
    }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(false);
    expect(continueButton.getAttribute("data-state")).toBe("available");
  });

  it("marks Nuevo juego as always available", () => {
    render(
      <StartScreen
        onNewGame={vi.fn()}
        onContinue={vi.fn()}
        resumeTarget={null}
      />,
    );
    const newGameButton = screen.getByRole("button", {
      name: /Nuevo juego/i,
    }) as HTMLButtonElement;
    expect(newGameButton.disabled).toBe(false);
    expect(newGameButton.getAttribute("data-state")).toBe("available");
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
