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
      <img
        className="chapter-select__bg"
        src="/images/chapter_selection.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="chapter-select__title-block" style={{ display: "contents" }}>
        <img
          className="chapter-select__title"
          src="/images/chapter_selection_title.svg"
          alt="Selección de capítulo"
        />
      </div>
      <div className="chapter-select__frames">
        {levels.map((level, index) => {
          const unlocked = isChapterUnlocked(index, completedChapters, totalLevels);
          const completed = completedChapters.includes(index);
          const locked = !unlocked;

          return (
            <button
              key={level.id}
              type="button"
              className={[
                "chapter-frame",
                locked && "chapter-frame--locked",
                completed && "chapter-frame--completed",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectChapter(index)}
              disabled={locked}
              aria-disabled={locked}
              aria-label={level.title}
            >
              <span className="chapter-frame__image">
                <img
                  src={`/images/chapter-${index + 1}-portrait.svg`}
                  alt=""
                  aria-hidden="true"
                />
                <span className="chapter-frame__number" aria-hidden="true">
                  {index + 1}
                </span>
                {locked && (
                  <span className="chapter-frame__overlay" aria-hidden="true">
                    🔒
                  </span>
                )}
                {completed && (
                  <span className="chapter-frame__overlay" aria-hidden="true">
                    ✓
                  </span>
                )}
              </span>
              <span className="chapter-frame__title">{level.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
