interface StartScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  resumeTarget: number | null;
}

export function StartScreen({
  onNewGame,
  onContinue,
  resumeTarget,
}: StartScreenProps) {
  const canContinue = resumeTarget !== null;

  return (
    <section className="start-screen" aria-label="Pantalla de inicio">
      <img
        className="start-screen__bg"
        src="/images/start-bg.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="start-screen__title-block">
        <h1>Mairin</h1>
        <h2>Retratos Rotos</h2>
      </div>
      <div className="start-screen-actions">
        <button
          type="button"
          className="start-button"
          data-state="available"
          onClick={onNewGame}
        >
          Nuevo juego
        </button>
        <button
          type="button"
          className="start-button"
          data-state={canContinue ? "available" : "unavailable"}
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
