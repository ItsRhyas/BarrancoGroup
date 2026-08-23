import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { __resetIntroStorage } from "./lib/session";

interface MockGameBoardProps {
  levelIndex: number;
  onAdvance: () => void;
  onComplete: () => void;
  onChapterCompleted?: (index: number) => void;
}

vi.mock("./components/GameBoard", () => ({
  GameBoard: (props: MockGameBoardProps) => (
    <div data-testid="game-board">
      <span data-testid="level-index">{props.levelIndex}</span>
      <button
        type="button"
        onClick={() => {
          props.onChapterCompleted?.(props.levelIndex);
          props.onAdvance();
        }}
      >
        Avanzar
      </button>
      <button
        type="button"
        onClick={() => {
          props.onChapterCompleted?.(props.levelIndex);
          props.onComplete();
        }}
      >
        Completado
      </button>
    </div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    __resetIntroStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function givenIntroSeen(): void {
    localStorage.setItem("mairin:introSeen", "true");
  }

  it("renders the start screen by default", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Nuevo juego/i })).toBeTruthy();
    const continueButton = screen.getByRole("button", {
      name: /Continuar/i,
    }) as HTMLButtonElement;
    expect(continueButton).toBeTruthy();
    expect(continueButton.disabled).toBe(false);
  });

  it("navigates from start to chapter select", () => {
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
  });

  it("starts a chapter and persists the index", () => {
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    expect(screen.getByTestId("game-board")).toBeTruthy();
    expect(screen.getByTestId("level-index").textContent).toBe("0");
    expect(sessionStorage.getItem("mairin:lastChapter")).toBe("0");
  });

  it("resumes the highest unlocked chapter from Continuar", () => {
    localStorage.setItem("mairin:completedChapters", "[0]");
    render(<App />);
    const continueButton = screen.getByRole("button", {
      name: /Continuar/i,
    }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(false);
    fireEvent.click(continueButton);
    expect(screen.getByTestId("game-board")).toBeTruthy();
    expect(screen.getByTestId("level-index").textContent).toBe("1");
  });

  it("does not render a back button on the start screen", () => {
    render(<App />);
    expect(
      screen.queryByRole("button", { name: /Volver/i, hidden: true }),
    ).toBeNull();
  });

  it("returns to chapter select from the game preserving the selected level", () => {
    localStorage.setItem("mairin:completedChapters", "[0]");
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Un juego para todos/i }),
    );
    expect(screen.getByTestId("level-index").textContent).toBe("1");
    fireEvent.click(
      screen.getByRole("button", { name: /Volver/i, hidden: true }),
    );
    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /Un juego para todos/i }),
    );
    expect(screen.getByTestId("level-index").textContent).toBe("1");
  });

  it("returns to start from chapter select", () => {
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Volver/i, hidden: true }));
    expect(screen.getByRole("button", { name: /Nuevo juego/i })).toBeTruthy();
  });

  it("returns to chapter select from the game", () => {
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Volver/i, hidden: true }));
    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
  });

  it("returns to chapter select after completing the final level", () => {
    localStorage.setItem("mairin:completedChapters", "[0]");
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Un juego para todos/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Completado/i }));
    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
  });

  it("loads completed chapters from localStorage on mount", () => {
    localStorage.setItem("mairin:completedChapters", "[0]");
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));

    const lockedCard = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(lockedCard.disabled).toBe(false);
  });

  it("records completion and unlocks the next chapter", () => {
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Avanzar/i }));

    expect(localStorage.getItem("mairin:completedChapters")).toBe("[0]");

    fireEvent.click(screen.getByRole("button", { name: /Volver/i, hidden: true }));
    const unlockedCard = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(unlockedCard.disabled).toBe(false);
  });

  it("deduplicates repeated chapter completions", () => {
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Avanzar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Volver/i, hidden: true }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Completado/i }));

    expect(localStorage.getItem("mairin:completedChapters")).toBe("[0]");
  });

  it("keeps working in-session when localStorage writes fail", () => {
    givenIntroSeen();
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /El saludo de Mairin/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Avanzar/i }));

    fireEvent.click(screen.getByRole("button", { name: /Volver/i, hidden: true }));
    const unlockedCard = screen.getByRole("button", {
      name: /Un juego para todos/i,
    }) as HTMLButtonElement;
    expect(unlockedCard.disabled).toBe(false);
  });

  it("treats malformed completed chapters as empty", () => {
    localStorage.setItem("mairin:completedChapters", "not-json");
    givenIntroSeen();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));

    const unlockedCard = screen.getByRole("button", {
      name: /El saludo de Mairin/i,
    }) as HTMLButtonElement;
    expect(unlockedCard.disabled).toBe(false);
  });

  it("shows the intro to a new player and completes to chapter select", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));

    expect(
      screen.getByText(
        "La vida de las personas se divide en momentos clave que guardamos en cuadros",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Saltar/i }));
    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
  });

  it("skips the intro for a returning player", () => {
    localStorage.setItem("mairin:introSeen", "true");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));

    expect(
      screen.getByRole("heading", { name: /Capítulos/i }),
    ).toBeTruthy();
  });

  it("skips the intro when continuing a game", () => {
    localStorage.setItem("mairin:completedChapters", "[0]");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(screen.getByTestId("game-board")).toBeTruthy();
  });

  it("persists introSeen after the intro completes", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo juego/i }));
    fireEvent.click(screen.getByRole("button", { name: /Saltar/i }));

    expect(localStorage.getItem("mairin:introSeen")).toBe("true");
  });
});
