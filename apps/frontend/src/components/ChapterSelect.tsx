import { levels } from "../game/levels";

interface ChapterSelectProps {
  onSelectChapter: (index: number) => void;
}

export function ChapterSelect({ onSelectChapter }: ChapterSelectProps) {
  return (
    <section className="chapter-select" aria-label="Selección de capítulo">
      <h2 className="chapter-select-title">Elige un capítulo</h2>
      <div className="chapter-cards">
        {levels.map((level, index) => (
          <button
            key={level.id}
            type="button"
            className="chapter-card"
            onClick={() => onSelectChapter(index)}
          >
            <span className="chapter-card-number" aria-hidden="true">
              {index + 1}
            </span>
            <h3 className="chapter-card-title">{level.title}</h3>
            <p className="chapter-card-narrative">{level.narrative}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
