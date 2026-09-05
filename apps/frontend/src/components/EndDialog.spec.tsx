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
    fireEvent.click(screen.getByRole("button", { name: /Siguiente capítulo/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /Volver a capítulos/i }));
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

  it("renders the correct header for a correct result", () => {
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("Vas por buen camino")).toBeTruthy();
    expect(screen.getByRole("heading", { name: correctEnding.title })).toBeTruthy();
  });

  it("renders the incorrect header for an incorrect result", () => {
    render(
      <EndDialog
        result={incorrectResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("Intenta algo diferente…")).toBeTruthy();
  });

  it("renders the illustration when the ending asset resolves", () => {
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(correctEnding.title)).toBeTruthy();
  });

  it("omits the illustration when the asset is missing", () => {
    const endingWithoutAsset = {
      ...correctEnding,
      imageAssetId: "ending:missing",
    };
    render(
      <EndDialog
        result={correctResult}
        endings={[endingWithoutAsset]}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText(endingWithoutAsset.title)).toBeNull();
    expect(document.querySelector(".end-dialog-illustration")).toBeNull();
  });

  it("applies the correct variant class for a correct result", () => {
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    const dialog = document.querySelector(".end-dialog--correct");
    expect(dialog).toBeTruthy();
    expect(document.querySelector(".end-dialog--incorrect")).toBeNull();
  });

  it("applies the incorrect variant class for an incorrect result", () => {
    render(
      <EndDialog
        result={incorrectResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    const dialog = document.querySelector(".end-dialog--incorrect");
    expect(dialog).toBeTruthy();
    expect(document.querySelector(".end-dialog--correct")).toBeNull();
  });

  it("shows the fallback guard when no ending matches the result", () => {
    const onRetry = vi.fn();
    render(
      <EndDialog
        result={{ correct: false, endingId: "ending:unknown" }}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText("Intenta algo diferente…")).toBeTruthy();
    expect(screen.getByText(/No se encontró el final/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the matched ending description for a correct result", () => {
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText(correctEnding.description)).toBeTruthy();
  });

  it("renders the matched ending description for an incorrect result", () => {
    render(
      <EndDialog
        result={incorrectResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText(incorrectEnding.description)).toBeTruthy();
  });

  it("exposes accessible labels tied to the header and description", () => {
    render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    const dialog = document.querySelector(".end-dialog");
    expect(dialog).toBeTruthy();

    const headerId = dialog?.getAttribute("aria-labelledby");
    const descriptionId = dialog?.getAttribute("aria-describedby");
    expect(headerId).toBeTruthy();
    expect(descriptionId).toBeTruthy();

    const header = headerId ? document.getElementById(headerId) : null;
    const description = descriptionId
      ? document.getElementById(descriptionId)
      : null;
    expect(header).toBeTruthy();
    expect(description).toBeTruthy();
    expect(header?.textContent).toBe("Vas por buen camino");
    expect(description?.textContent).toBe(correctEnding.description);
  });

  it("closes the dialog when the result is cleared", () => {
    const { rerender } = render(
      <EndDialog
        result={correctResult}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    const dialog = document.querySelector(".end-dialog") as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    rerender(
      <EndDialog
        result={null}
        endings={endings}
        isFinalLevel={false}
        onAdvance={vi.fn()}
        onComplete={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(dialog.open).toBe(false);
  });
});
