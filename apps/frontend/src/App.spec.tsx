import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

interface MockGameBoardProps {
  levelIndex: number;
  onBack: () => void;
  onAdvance: () => void;
  onComplete: () => void;
}

vi.mock("./components/GameBoard", () => ({
  GameBoard: (props: MockGameBoardProps) => (
    <div data-testid="game-board">
      <span data-testid="level-index">{props.levelIndex}</span>
      <button type="button" onClick={props.onBack}>
        Volver a capítulos
      </button>
      <button type="button" onClick={props.onAdvance}>
        Avanzar
      </button>
      <button type="button" onClick={props.onComplete}>
        Completado
      </button>
    </div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders the start screen by default", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Nuevo juego/i })).toBeTruthy();
    const continueButton = screen.getByRole("button", {
      name: /Continuar/i,
    }) as HTMLButtonElement;
    expect(continueButton).toBeTruthy();
    expect(continueButton.disabled).toBe(true);
  });

  it("navigates from start to chapter select", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    expect(
      screen.getByRole("heading", { name: /Elige un capítulo/i }),
    ).toBeTruthy();
  });

  it("starts a chapter and persists the index", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    expect(screen.getByTestId("game-board")).toBeTruthy();
    expect(screen.getByTestId("level-index").textContent).toBe("0");
    expect(sessionStorage.getItem("mairin:lastChapter")).toBe("0");
  });

  it("resumes from Continuar when a chapter was saved", () => {
    sessionStorage.setItem("mairin:lastChapter", "1");
    render(<App />);
    const continueButton = screen.getByRole("button", {
      name: /Continuar/i,
    }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(false);
    fireEvent.click(continueButton);
    expect(screen.getByTestId("game-board")).toBeTruthy();
    expect(screen.getByTestId("level-index").textContent).toBe("1");
  });

  it("returns to chapter select from the game", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Volver a capítulos/i }));
    expect(
      screen.getByRole("heading", { name: /Elige un capítulo/i }),
    ).toBeTruthy();
  });

  it("returns to chapter select after completing the final level", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Un juego para todos/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Completado/i }));
    expect(
      screen.getByRole("heading", { name: /Elige un capítulo/i }),
    ).toBeTruthy();
  });
});
