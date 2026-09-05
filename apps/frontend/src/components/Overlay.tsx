import { useCallback, useEffect, useState } from "react";

interface UseFullscreenResult {
  isFullscreen: boolean;
  toggle: () => void;
  supported: boolean;
}

function useFullscreen(): UseFullscreenResult {
  const [supported] = useState(() => {
    return typeof document !== "undefined" && !!document.fullscreenEnabled;
  });
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== "undefined" && !!document.fullscreenElement;
  });

  useEffect(() => {
    if (!supported) {
      return;
    }

    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, [supported]);

  const toggle = useCallback(() => {
    if (!supported) {
      return;
    }
    if (isFullscreen) {
      document.exitFullscreen()?.catch(() => {});
    } else {
      document.documentElement.requestFullscreen()?.catch(() => {});
    }
  }, [isFullscreen, supported]);

  return { isFullscreen, toggle, supported };
}

export interface OverlayProps {
  canGoBack: boolean;
  onBack: () => void;
}

export function Overlay({ canGoBack, onBack }: OverlayProps) {
  const { isFullscreen, toggle, supported } = useFullscreen();

  return (
    <div className="overlay" aria-hidden="true">
      {canGoBack && (
        <button
          type="button"
          className="overlay-button overlay-back"
          aria-label="Volver"
          aria-hidden={undefined}
          onClick={onBack}
        >
          <span aria-hidden="true">←</span>
        </button>
      )}
      {supported && (
        <button
          type="button"
          className="overlay-button overlay-fullscreen"
          aria-label={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
          aria-pressed={isFullscreen}
          aria-hidden={undefined}
          onClick={toggle}
        >
          <span aria-hidden="true">⛶</span>
        </button>
      )}
    </div>
  );
}
