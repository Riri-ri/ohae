import type { Shape } from '../types/shape';
import { KIND_LABEL } from '../constants/shapes';

interface PropertiesPanelProps {
  shape: Shape | null;
  onUpdate: (patch: Partial<Omit<Shape, 'id'>>) => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-zinc-800/60 px-2 py-1.5 text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}

export function PropertiesPanel({ shape, onUpdate }: PropertiesPanelProps) {
  return (
    <aside
      aria-label="Свойства фигуры"
      className="flex flex-col gap-2 overflow-y-auto border-b border-zinc-800 p-3"
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Design
      </div>
      {shape ? (
        <>
          <div className="text-sm font-medium text-zinc-100">{KIND_LABEL[shape.kind]}</div>
          <Field label="X" value={String(Math.round(shape.x))} />
          <Field label="Y" value={String(Math.round(shape.y))} />
          <Field label="W" value={String(Math.round(shape.width))} />
          <Field label="H" value={String(Math.round(shape.height))} />
          {shape.kind !== 'image' && (
            <div className="flex items-center justify-between rounded-md bg-zinc-800/60 px-2 py-1.5 text-xs">
              <span className="text-zinc-500">Fill</span>
              <label className="flex items-center gap-2">
                <input
                  type="color"
                  value={shape.fill}
                  onChange={(e) => onUpdate({ fill: e.target.value })}
                  className="h-6 w-8 cursor-pointer rounded border-none bg-transparent p-0"
                />
                <span className="font-mono text-zinc-200">{shape.fill}</span>
              </label>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-zinc-600">Nothing selected</p>
      )}
    </aside>
  );
}