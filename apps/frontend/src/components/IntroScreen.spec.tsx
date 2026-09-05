import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { IntroScreen } from "./IntroScreen";
import type { IntroItem } from "../game/intro.generated";

const items: IntroItem[] = [
  { text: "Primera frase", imageSrc: "/images/intro-1.svg" },
  { text: "Segunda frase", imageSrc: "/images/intro-2.svg" },
  { text: "Tercera frase", imageSrc: "/images/intro-3.svg" },
  { text: "Cuarta frase", imageSrc: "/images/intro-4.svg" },
];

describe("IntroScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the first phrase and image", () => {
    const { container } = render(
      <IntroScreen items={items} onComplete={vi.fn()} />,
    );
    expect(screen.getByText("Primera frase")).toBeTruthy();
    const img = container.querySelector(
      ".intro-screen__image img",
    ) as HTMLImageElement;
    expect(img.src).toContain("/images/intro-1.svg");
  });

  it("auto-advances to the next phrase after 3000ms", () => {
    render(<IntroScreen items={items} onComplete={vi.fn()} />);
    expect(screen.getByText("Primera frase")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("Segunda frase")).toBeTruthy();
  });

  it("advances through all phrases and calls onComplete after the last", () => {
    const onComplete = vi.fn();
    render(<IntroScreen items={items} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("Segunda frase")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("Tercera frase")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("Cuarta frase")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("advances immediately when clicked", () => {
    render(<IntroScreen items={items} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole("region", { name: /Introducción/i }));
    expect(screen.getByText("Segunda frase")).toBeTruthy();
  });

  it("advances on Enter key", () => {
    render(<IntroScreen items={items} onComplete={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("region", { name: /Introducción/i }), {
      key: "Enter",
    });
    expect(screen.getByText("Segunda frase")).toBeTruthy();
  });

  it("advances on Space key", () => {
    render(<IntroScreen items={items} onComplete={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("region", { name: /Introducción/i }), {
      key: " ",
    });
    expect(screen.getByText("Segunda frase")).toBeTruthy();
  });

  it("calls onComplete when Saltar is clicked", () => {
    const onComplete = vi.fn();
    render(<IntroScreen items={items} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /Saltar/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("clears pending timers when unmounted", () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <IntroScreen items={items} onComplete={onComplete} />,
    );
    unmount();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("calls onComplete immediately when items is empty", () => {
    const onComplete = vi.fn();
    render(<IntroScreen items={[]} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("disables fade animation when reduced motion is preferred", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    render(<IntroScreen items={items} onComplete={vi.fn()} />);
    const image = document.querySelector(".intro-screen__image");
    expect(image).toBeTruthy();

    window.matchMedia = originalMatchMedia;
  });
});
