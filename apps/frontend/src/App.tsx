import { useCallback, useEffect, useMemo, useState } from "react";
import { ChapterSelect } from "./components/ChapterSelect";
import { GameBoard } from "./components/GameBoard";
import { IntroScreen } from "./components/IntroScreen";
import { Overlay } from "./components/Overlay";
import { RotateDevice } from "./components/RotateDevice";
import { StartScreen } from "./components/StartScreen";
import {
  readCompletedChapters,
  readIntroSeen,
  writeCompletedChapters,
  writeCompletedChaptersAll,
  writeIntroSeen,
  writeLastChapter,
} from "./lib/session";
import { ensureSession, recordAttempt } from "./lib/api";
import {
  backfillMissing,
  hydrateProgress,
  levelIdForIndex,
} from "./lib/progress";
import { ensureAccessToken } from "./lib/auth";
import type { ValidationResult } from "./game/types";
import { introItems } from "./game/intro.generated";
import { isChapterUnlocked } from "./game/unlock";
import { levels } from "./game/levels";
import "./App.css";

type Screen =
  | { kind: "start" }
  | { kind: "intro" }
  | { kind: "chapter-select" }
  | { kind: "game" };

function mergeCompletedChapters(
  completed: number[],
  index: number,
): number[] {
  return Array.from(new Set([...completed, index])).sort((a, b) => a - b);
}

function mergeCompletedLists(a: number[], b: number[]): number[] {
  return Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
}

function computeResumeTarget(completed: number[]): number | null {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (isChapterUnlocked(i, completed, levels.length)) {
      return i;
    }
  }
  return null;
}

function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [completedChapters, setCompletedChapters] = useState<number[]>(() =>
    readCompletedChapters(),
  );
  const [introSeen, setIntroSeen] = useState<boolean>(() => readIntroSeen());

  const resumeTarget = useMemo(
    () => computeResumeTarget(completedChapters),
    [completedChapters],
  );

  // On mount, authenticate (silently) and reconcile local progress with the
  // server (offline-first). The server never revokes locally-completed
  // chapters; it only adds new ones.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await ensureAccessToken();
        if (cancelled) {
          return;
        }
        const serverCompleted = await hydrateProgress();
        if (cancelled) {
          return;
        }
        const localCompleted = readCompletedChapters();
        const merged = mergeCompletedLists(localCompleted, serverCompleted);
        if (merged.length > localCompleted.length) {
          writeCompletedChaptersAll(merged);
          setCompletedChapters(merged);
        }
        await backfillMissing(localCompleted, serverCompleted);
      } catch {
        // Offline: keep the local progress as-is.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const startNew = useCallback(() => {
    void ensureAccessToken()
      .then(() => ensureSession())
      .catch(() => {});
    if (!introSeen) {
      setScreen({ kind: "intro" });
    } else {
      setScreen({ kind: "chapter-select" });
    }
  }, [introSeen]);

  const handleIntroComplete = useCallback(() => {
    writeIntroSeen();
    setIntroSeen(true);
    setScreen({ kind: "chapter-select" });
  }, []);

  const continueGame = useCallback(() => {
    if (resumeTarget === null) {
      return;
    }
    writeLastChapter(resumeTarget);
    setSelectedLevel(resumeTarget);
    setScreen({ kind: "game" });
  }, [resumeTarget]);

  const selectChapter = useCallback((index: number) => {
    writeLastChapter(index);
    setSelectedLevel(index);
    setScreen({ kind: "game" });
  }, []);

  const goBack = useCallback(() => {
    if (screen.kind === "game") {
      setScreen({ kind: "chapter-select" });
    } else if (screen.kind === "chapter-select") {
      setScreen({ kind: "start" });
    }
  }, [screen.kind]);

  const canGoBack = screen.kind !== "start" && screen.kind !== "intro";

  const advanceLevel = useCallback(() => {
    setSelectedLevel((prev) => prev + 1);
  }, []);

  const completeGame = useCallback(() => {
    setScreen({ kind: "chapter-select" });
  }, []);

  const handleChapterCompleted = useCallback((index: number) => {
    writeCompletedChapters(index);
    setCompletedChapters((prev) => mergeCompletedChapters(prev, index));
  }, []);

  const handleAttempt = useCallback(
    (result: ValidationResult, index: number) => {
      const levelId = levelIdForIndex(index);
      if (!levelId) {
        return;
      }
      void ensureAccessToken()
        .then(() =>
          recordAttempt({
            levelId,
            success: result.correct,
            endingId: result.endingId,
          }),
        )
        .catch(() => {});
    },
    [],
  );

  return (
    <>
      <div className="stage">
        {screen.kind === "start" && (
          <StartScreen
            onNewGame={startNew}
            onContinue={continueGame}
            resumeTarget={resumeTarget}
          />
        )}
        {screen.kind === "intro" && (
          <IntroScreen items={introItems} onComplete={handleIntroComplete} />
        )}
        {screen.kind === "chapter-select" && (
          <ChapterSelect
            onSelectChapter={selectChapter}
            completedChapters={completedChapters}
            totalLevels={levels.length}
          />
        )}
        {screen.kind === "game" && (
          <GameBoard
            key={selectedLevel}
            levelIndex={selectedLevel}
            onAdvance={advanceLevel}
            onComplete={completeGame}
            onChapterCompleted={handleChapterCompleted}
            onAttempt={handleAttempt}
          />
        )}
        <RotateDevice />
      </div>
      <Overlay canGoBack={canGoBack} onBack={goBack} />
    </>
  );
}

export default App;
