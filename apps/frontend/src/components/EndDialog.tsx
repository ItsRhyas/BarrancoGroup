import { useEffect, useId, useRef } from "react";
import type { Ending, ValidationResult } from "../game/types";

interface EndDialogProps {
  result: ValidationResult | null;
  endings: Ending[];
  isFinalLevel: boolean;
  onAdvance: () => void;
  onRetry: () => void;
}

export function EndDialog({
  result,
  endings,
  isFinalLevel,
  onAdvance,
  onRetry,
}: EndDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
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

  if (!ending) {
    return <dialog ref={dialogRef} className="end-dialog" />;
  }

  return (
    <dialog
      ref={dialogRef}
      className="end-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="end-dialog-content">
        <h2 id={titleId}>{ending.title}</h2>
        <p id={descriptionId}>{ending.description}</p>
        {result?.correct ? (
          <button type="button" className="end-button" onClick={onAdvance}>
            {isFinalLevel ? "Completado" : "Avanzar"}
          </button>
        ) : (
          <button type="button" className="end-button" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    </dialog>
  );
}
