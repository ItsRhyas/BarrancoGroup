import { useCallback, useState } from "react";
import { ChapterSelect } from "./components/ChapterSelect";
import { GameBoard } from "./components/GameBoard";
import { RotateDevice } from "./components/RotateDevice";
import { StartScreen } from "./components/StartScreen";
import { readLastChapter, writeLastChapter } from "./lib/session";
import "./App.css";

type Screen =
  | { kind: "start" }
  | { kind: "chapter-select" }
  | { kind: "game" };

function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });
  const [selectedLevel, setSelectedLevel] = useState<number>(0);

  const startNew = useCallback(() => {
    setScreen({ kind: "chapter-select" });
  }, []);

  const continueGame = useCallback(() => {
    const lastChapter = readLastChapter();
    if (lastChapter === null) {
      return;
    }
    writeLastChapter(lastChapter);
    setSelectedLevel(lastChapter);
    setScreen({ kind: "game" });
  }, []);

  const selectChapter = useCallback((index: number) => {
    writeLastChapter(index);
    setSelectedLevel(index);
    setScreen({ kind: "game" });
  }, []);

  return (
    <div className="stage">
      {screen.kind === "start" && (
        <StartScreen onNewGame={startNew} onContinue={continueGame} />
      )}
      {screen.kind === "chapter-select" && (
        <ChapterSelect onSelectChapter={selectChapter} />
      )}
      {screen.kind === "game" && (
        <GameBoard
          key={selectedLevel}
          levelIndex={selectedLevel}
        />
      )}
      <RotateDevice />
    </div>
  );
}

export default App;
