import { useEffect, useId, useRef } from "react";
import { assetRegistry } from "../game/assets";
import type { Ending, ValidationResult } from "../game/types";
import { AssetView } from "./AssetView";

interface EndDialogProps {
  result: ValidationResult | null;
  endings: Ending[];
  isFinalLevel: boolean;
  onAdvance: () => void;
  onComplete: () => void;
  onRetry: () => void;
}

const RESULT_HEADERS = {
  correct: "Vas por buen camino",
  incorrect: "Intenta algo diferente…",
};

export function EndDialog({
  result,
  endings,
  isFinalLevel,
  onAdvance,
  onComplete,
  onRetry,
}: EndDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (result) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [result]);

  const ending = result
    ? endings.find((e) => e.id === result.endingId)
    : null;

  const variant = result?.correct ? "correct" : "incorrect";
  const variantClass = `end-dialog--${variant}`;

  const handleRetry = () => {
    onRetry();
  };

  if (!result || !ending) {
    return (
      <dialog
        ref={dialogRef}
        className={`end-dialog ${variantClass}`}
        aria-labelledby={headerId}
        aria-describedby={descriptionId}
      >
        <div className="end-dialog-content">
          <h2 id={headerId} className="end-dialog-header">
            {RESULT_HEADERS.incorrect}
          </h2>
          <p id={descriptionId} className="end-dialog-description">
            No se encontró el final de este capítulo. Inténtalo de nuevo.
          </p>
          <button
            type="button"
            className="end-button"
            onClick={handleRetry}
          >
            Reintentar
          </button>
        </div>
      </dialog>
    );
  }

  const illustrationAsset =
    ending.imageAssetId && assetRegistry[ending.imageAssetId]
      ? ending.imageAssetId
      : null;

  const headerText = RESULT_HEADERS[variant];
  const buttonLabel = result.correct
    ? isFinalLevel
      ? "Volver a capítulos"
      : "Siguiente capítulo"
    : "Reintentar";
  const buttonAction = result.correct
    ? isFinalLevel
      ? onComplete
      : onAdvance
    : handleRetry;

  return (
    <dialog
      ref={dialogRef}
      className={`end-dialog ${variantClass}`}
      aria-labelledby={headerId}
      aria-describedby={descriptionId}
    >
      <div className="end-dialog-content">
        <h2 id={headerId} className="end-dialog-header">
          {headerText}
        </h2>
        <h3 className="end-dialog-subtitle">{ending.title}</h3>
        {illustrationAsset && (
          <div className="end-dialog-illustration">
            <AssetView assetId={illustrationAsset} label={ending.title} />
          </div>
        )}
        <p id={descriptionId} className="end-dialog-description">
          {ending.description}
        </p>
        <button
          type="button"
          className="end-button"
          onClick={buttonAction}
        >
          {buttonLabel}
        </button>
      </div>
    </dialog>
  );
}
