import { levels } from "../game/levels";
import { isChapterUnlocked } from "../game/unlock";

interface ChapterSelectProps {
  onSelectChapter: (index: number) => void;
  completedChapters: number[];
  totalLevels: number;
}

export function ChapterSelect({
  onSelectChapter,
  completedChapters,
  totalLevels,
}: ChapterSelectProps) {
  return (
    <section className="chapter-select" aria-label="Selección de capítulo">
      <h2 className="chapter-select-title">Elige un capítulo</h2>
      <div className="chapter-cards">
        {levels.map((level, index) => {
          const unlocked = isChapterUnlocked(index, completedChapters, totalLevels);
          const completed = completedChapters.includes(index);
          const locked = !unlocked;

          return (
            <button
              key={level.id}
              type="button"
              className={[
                "chapter-card",
                locked && "chapter-card--locked",
                completed && "chapter-card--completed",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectChapter(index)}
              disabled={locked}
              aria-disabled={locked}
            >
              <span className="chapter-card-number" aria-hidden="true">
                {locked ? (
                  <span className="chapter-card-indicator">🔒</span>
                ) : completed ? (
                  <span className="chapter-card-indicator">✓</span>
                ) : (
                  index + 1
                )}
              </span>
              <h3 className="chapter-card-title">{level.title}</h3>
              <p className="chapter-card-narrative">{level.narrative}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
