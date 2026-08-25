import { useCallback, useEffect, useRef, useState } from "react";
import type { IntroItem } from "../game/intro.generated";

interface IntroScreenProps {
  items: IntroItem[];
  onComplete: () => void;
}

export function IntroScreen({ items, onComplete }: IntroScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const isLast = currentIndex >= items.length - 1;

  const advance = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLast, onComplete]);

  useEffect(() => {
    if (items.length === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      advance();
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, items.length, advance, onComplete]);

  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  const handleClick = useCallback(() => {
    advance();
  }, [advance]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }
    },
    [advance],
  );

  const handleSkip = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onComplete();
    },
    [onComplete],
  );

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <section
      className="intro-screen"
      role="region"
      aria-label="Introducción"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={sectionRef}
    >
      <div className="intro-screen__image" key={currentIndex}>
        <img src={currentItem.imageSrc} alt="" aria-hidden="true" />
      </div>
      <div className="intro-screen__phrase-block" aria-live="polite">
        <p className="intro-screen__phrase">{currentItem.text}</p>
      </div>
      <div className="intro-screen__progress" aria-hidden="true">
        {items.map((_, index) => (
          <span
            key={index}
            className={[
              "intro-dot",
              index === currentIndex && "intro-dot--active",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
      <button
        type="button"
        className="intro-screen__skip"
        onClick={handleSkip}
        aria-label="Saltar introducción"
      >
        Saltar
      </button>
    </section>
  );
}
