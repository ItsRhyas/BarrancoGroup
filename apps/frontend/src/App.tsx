import { useCallback, useMemo, useState } from "react";
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
  writeIntroSeen,
  writeLastChapter,
} from "./lib/session";
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

  const startNew = useCallback(() => {
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
          />
        )}
        <RotateDevice />
      </div>
      <Overlay canGoBack={canGoBack} onBack={goBack} />
    </>
  );
}

export default App;
