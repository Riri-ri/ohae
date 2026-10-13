import { CURSORS } from '../constants/cursors';

interface CursorSectionProps {
  cursorId: string;
  onSelect: (id: string) => void;
}

export function CursorSection({ cursorId, onSelect }: CursorSectionProps) {
  const active = CURSORS.find((option) => option.id === cursorId) ?? CURSORS[0];

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-1 text-sm font-semibold text-zinc-100">Курсор</div>
      <p className="mb-4 max-w-2xl text-xs text-zinc-500">
        Выбери курсор — он применится по всему приложению. Функциональные курсоры редактора (прицел при
        рисовании, стрелки ресайза, захват при панорамировании) остаются как в фигме.
      </p>

      <div
        className="mb-5 flex h-28 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-rail text-xs text-zinc-500"
        style={{ cursor: active.value }}
      >
        Текущий курсор: {active.label}. Наведи сюда и подвигай мышкой
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CURSORS.map((option) => {
          const selected = option.id === cursorId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              style={{ cursor: option.value }}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
                selected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-800 bg-surface hover:border-zinc-700'
              }`}
            >
              <span
                className="flex h-12 w-full items-center justify-center rounded-lg border border-zinc-800 bg-preview text-[11px] text-zinc-500"
                style={{ cursor: option.value }}
              >
                Наведи
              </span>
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`text-xs font-medium ${selected ? 'text-blue-200' : 'text-zinc-200'}`}>
                  {option.label}
                </span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
