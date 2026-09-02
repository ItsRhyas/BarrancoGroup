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
        >
          <img
            className="New_Game__img"
            src="/images/Nuevo Juego.svg"
            alt="Nuevo Juego"
          />
        </button>
        <button
          type="button"
          className="start-button"
          data-state={canContinue ? "available" : "unavailable"}
          onClick={onContinue}
          disabled={!canContinue}
          aria-disabled={!canContinue}
        >
          <img
            className="Continue__img"
            src="/images/Continuar.svg"
            alt="Continuar"
          />
        </button>
      </div>
    </section>
  );
}
