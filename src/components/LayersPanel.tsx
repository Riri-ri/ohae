import type { Shape } from '../types/shape';
import { KIND_LABEL } from '../constants/shapes';

interface LayersPanelProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function LayersPanel({ shapes, selectedId, onSelect }: LayersPanelProps) {
  const topFirst = [...shapes].reverse();

  return (
    <aside aria-label="Слои" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Layers
      </div>
      {topFirst.length === 0 && <p className="text-xs text-zinc-600">No layers yet</p>}
      {topFirst.map((shape, index) => {
        const layerNumber = shapes.length - index;
        return (
          <button
            key={shape.id}
            type="button"
            className={`rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              shape.id === selectedId
                ? 'bg-blue-500/20 text-blue-300'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
            onClick={() => onSelect(shape.id)}
          >
            {KIND_LABEL[shape.kind]} {layerNumber}
          </button>
        );
      })}
    </aside>
  );
}