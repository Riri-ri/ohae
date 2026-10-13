import type { SectionId } from '../types/app';
import { CatLogo } from './CatLogo';

interface SectionTab {
  id: SectionId;
  label: string;
}

const SECTIONS: SectionTab[] = [
  { id: 'works', label: 'Ваши работы' },
  { id: 'proposals', label: 'Предложения дизайнов' },
  { id: 'cats', label: 'Котики' },
  { id: 'cursor', label: 'Курсор' },
];

interface TopNavProps {
  section: SectionId;
  onSelect: (section: SectionId) => void;
  onHome: () => void;
}

export function TopNav({ section, onSelect, onHome }: TopNavProps) {
  return (
    <header className="z-40 flex flex-col gap-2 border-b border-zinc-800 bg-surface px-3 py-2 md:flex-row md:items-center md:gap-4 md:px-4">
      <button
        type="button"
        onClick={onHome}
        title="На стартовую страницу"
        className="flex items-center gap-2 text-left"
      >
        <CatLogo className="h-7 w-7 shrink-0" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-100">minifigma</div>
          <div className="text-[10px] text-zinc-500">мини-фигма в кармане</div>
        </div>
      </button>

      <nav className="flex items-center gap-1 overflow-x-auto md:ml-2" aria-label="Разделы">
        {SECTIONS.map((tab) => {
          const active = tab.id === section;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(tab.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
