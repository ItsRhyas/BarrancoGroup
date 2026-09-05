import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Overlay } from "./Overlay";

describe("Overlay", () => {
  beforeEach(() => {
    const doc = document as Document & {
      fullscreenEnabled: boolean;
      fullscreenElement: Element | null;
    };
    doc.fullscreenEnabled = true;
    doc.fullscreenElement = null;
    vi.restoreAllMocks();
  });

  it("does not render back button when canGoBack is false", () => {
    render(<Overlay canGoBack={false} onBack={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: /Volver/i, hidden: true }),
    ).toBeNull();
  });

  it("renders back button and calls onBack when activated", () => {
    const onBack = vi.fn();
    render(<Overlay canGoBack={true} onBack={onBack} />);
    const backButton = screen.getByRole("button", {
      name: /Volver/i,
      hidden: true,
    });
    expect(backButton).toBeTruthy();
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("enters fullscreen and updates aria-pressed on fullscreenchange", () => {
    const requestSpy = vi.spyOn(document.documentElement, "requestFullscreen");
    render(<Overlay canGoBack={false} onBack={vi.fn()} />);
    const fsButton = screen.getByRole("button", {
      name: /Pantalla completa/i,
      hidden: true,
    });
    expect(fsButton.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(fsButton);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(fsButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("exits fullscreen and updates aria-pressed on fullscreenchange", () => {
    const doc = document as Document & {
      fullscreenElement: Element | null;
    };
    doc.fullscreenElement = document.documentElement;
    const exitSpy = vi.spyOn(document, "exitFullscreen");
    render(<Overlay canGoBack={false} onBack={vi.fn()} />);
    const fsButton = screen.getByRole("button", {
      name: /Salir de pantalla completa/i,
      hidden: true,
    });
    expect(fsButton.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(fsButton);
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(fsButton.getAttribute("aria-pressed")).toBe("false");
  });

  it("does not render fullscreen button when fullscreenEnabled is false", () => {
    const doc = document as Document & {
      fullscreenEnabled: boolean;
    };
    doc.fullscreenEnabled = false;
    render(<Overlay canGoBack={true} onBack={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: /Pantalla completa/i, hidden: true }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: /Volver/i, hidden: true }),
    ).toBeTruthy();
  });

  it("layer uses overlay class while buttons use overlay-button class", () => {
    render(<Overlay canGoBack={true} onBack={vi.fn()} />);
    const layer = document.querySelector(".overlay");
    expect(layer).toBeTruthy();
    expect(layer!.classList.contains("overlay")).toBe(true);
    const backButton = screen.getByRole("button", {
      name: /Volver/i,
      hidden: true,
    });
    expect(backButton.classList.contains("overlay-button")).toBe(true);
    expect(backButton.classList.contains("overlay-back")).toBe(true);
  });

  it("swallows fullscreen request rejection without throwing", () => {
    vi.spyOn(document.documentElement, "requestFullscreen").mockRejectedValue(
      new Error("Fullscreen denied"),
    );
    render(<Overlay canGoBack={false} onBack={vi.fn()} />);
    const fsButton = screen.getByRole("button", {
      name: /Pantalla completa/i,
      hidden: true,
    });
    expect(() => fireEvent.click(fsButton)).not.toThrow();
  });

  it("swallows fullscreen exit rejection without throwing", () => {
    const doc = document as Document & {
      fullscreenElement: Element | null;
    };
    doc.fullscreenElement = document.documentElement;
    vi.spyOn(document, "exitFullscreen").mockRejectedValue(
      new Error("Not in fullscreen"),
    );
    render(<Overlay canGoBack={false} onBack={vi.fn()} />);
    const fsButton = screen.getByRole("button", {
      name: /Salir de pantalla completa/i,
      hidden: true,
    });
    expect(() => fireEvent.click(fsButton)).not.toThrow();
  });

  it("switches fullscreen aria-label when state changes", () => {
    render(<Overlay canGoBack={false} onBack={vi.fn()} />);
    const fsButton = screen.getByRole("button", {
      name: /Pantalla completa/i,
      hidden: true,
    });
    expect(fsButton.getAttribute("aria-label")).toBe("Pantalla completa");
    fireEvent.click(fsButton);
    expect(fsButton.getAttribute("aria-label")).toBe(
      "Salir de pantalla completa",
    );
  });
});
