import { useState } from "react";

interface StartScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  resumeTarget: number | null;
}

type ActionKey = "new" | "continue";

const BUTTON_IMAGES: Record<
  ActionKey,
  { base: string; active: string; alt: string }
> = {
  new: {
    base: "/images/Nuevo Juego.svg",
    active: "/images/Nuevo Juego Click.svg",
    alt: "Nuevo Juego",
  },
  continue: {
    base: "/images/Continuar.svg",
    active: "/images/Continuar Click.svg",
    alt: "Continuar",
  },
};

export function StartScreen({
  onNewGame,
  onContinue,
  resumeTarget,
}: StartScreenProps) {
  const canContinue = resumeTarget !== null;
  const [hovered, setHovered] = useState<ActionKey | null>(null);

  const hoverProps = (key: ActionKey, enabled: boolean) =>
    enabled
      ? {
          onMouseEnter: () => setHovered(key),
          onMouseLeave: () => setHovered(null),
          onFocus: () => setHovered(key),
          onBlur: () => setHovered(null),
        }
      : {};

  const srcFor = (key: ActionKey) =>
    hovered === key ? BUTTON_IMAGES[key].active : BUTTON_IMAGES[key].base;

  return (
    <section className="start-screen" aria-label="Pantalla de inicio">
      <img
        className="start-screen__bg"
        src="/images/Fondo.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="start-screen__title-block">
        <h1>
          <img className="Title__img" src="/images/Title.svg" alt="Mairin" />
        </h1>
        <h2>
          <img
            className="Subtitle__img"
            src="/images/Subtitle.svg"
            alt="Retratos Rotos"
          />
        </h2>
      </div>
      <div className="start-screen-actions">
        <button
          type="button"
          className="start-button"
          data-state="available"
          onClick={onNewGame}
          {...hoverProps("new", true)}
        >
          <img
            className="New_Game__img"
            src={srcFor("new")}
            alt={BUTTON_IMAGES.new.alt}
          />
        </button>
        <button
          type="button"
          className="start-button"
          data-state={canContinue ? "available" : "unavailable"}
          onClick={onContinue}
          disabled={!canContinue}
          aria-disabled={!canContinue}
          {...hoverProps("continue", canContinue)}
        >
          <img
            className="Continue__img"
            src={srcFor("continue")}
            alt={BUTTON_IMAGES.continue.alt}
          />
        </button>
      </div>
    </section>
  );
}
