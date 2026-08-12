import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EndDialog } from "./EndDialog";
import { levels } from "../game/levels";

describe("EndDialog", () => {
  const endings = levels[0].endings;
  const correctEnding = endings.find((e) => e.type === "correct")!;
  const incorrectEnding = endings.find((e) => e.type === "incorrect")!;

  const correctResult = {
    correct: true,
    endingId: correctEnding.id,
  };

  const incorrectResult = {
    correct: false,
    endingId: incorrectEnding.id,
  };

  it("calls onAdvance for a correct result on a non-final level", () => {
    const onAdvance = vi.fn();
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={onAdvance}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Avanzar/i }));
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete for a correct result on the final level", () => {
    const onComplete = vi.fn();
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={true}
        onAdvance={vi.fn()}
        onComplete={onComplete}
        onRetry={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Completado/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry for an incorrect result", () => {
    const onRetry = vi.fn();
    render(
      <EndDialog
        result={incorrectResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
