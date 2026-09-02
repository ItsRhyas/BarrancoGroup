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

  it("swaps the Nuevo Juego image while hovered", () => {
    const { container } = render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={0} />,
    );
    const image = container.querySelector(
      ".New_Game__img",
    ) as HTMLImageElement;
    const button = screen.getByRole("button", { name: /Nuevo juego/i });

    expect(image.getAttribute("src")).toBe("/images/Nuevo Juego.svg");
    fireEvent.mouseEnter(button);
    expect(image.getAttribute("src")).toBe("/images/Nuevo Juego Click.svg");
    fireEvent.mouseLeave(button);
    expect(image.getAttribute("src")).toBe("/images/Nuevo Juego.svg");
  });

  it("swaps the Continuar image while hovered", () => {
    const { container } = render(
      <StartScreen onNewGame={vi.fn()} onContinue={vi.fn()} resumeTarget={0} />,
    );
    const image = container.querySelector(
      ".Continue__img",
    ) as HTMLImageElement;
    const button = screen.getByRole("button", { name: /Continuar/i });

    expect(image.getAttribute("src")).toBe("/images/Continuar.svg");
    fireEvent.mouseEnter(button);
    expect(image.getAttribute("src")).toBe("/images/Continuar Click.svg");
    fireEvent.mouseLeave(button);
    expect(image.getAttribute("src")).toBe("/images/Continuar.svg");
  });

  it("does not swap the Continuar image when disabled", () => {
    const { container } = render(
      <StartScreen
        onNewGame={vi.fn()}
        onContinue={vi.fn()}
        resumeTarget={null}
      />,
    );
    const image = container.querySelector(
      ".Continue__img",
    ) as HTMLImageElement;
    const button = screen.getByRole("button", { name: /Continuar/i });

    expect(image.getAttribute("src")).toBe("/images/Continuar.svg");
    fireEvent.mouseEnter(button);
    expect(image.getAttribute("src")).toBe("/images/Continuar.svg");
  });
});
