import { readLastChapter } from "../lib/session";

interface StartScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
}

export function StartScreen({ onNewGame, onContinue }: StartScreenProps) {
  const canContinue = readLastChapter() !== null;

  return (
    <section className="start-screen" aria-label="Pantalla de inicio">
      <div className="start-screen-actions">
        <button
          type="button"
          className="start-button"
          onClick={onNewGame}
        >
          Nuevo juego
        </button>
        <button
          type="button"
          className="start-button"
          onClick={onContinue}
          disabled={!canContinue}
          aria-disabled={!canContinue}
        >
          Continuar
        </button>
      </div>
    </section>
  );
}
