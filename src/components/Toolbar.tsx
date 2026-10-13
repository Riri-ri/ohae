import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { Tool } from '../types/shape';
import { TOOLS } from '../constants/tools';

const TOOL_ICONS: Record<Tool, ReactNode> = {
  select: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 3l15 8.5-7.2 1.6-2.3 7L5 3z" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4.5" y="4.5" width="15" height="15" rx="1" />
    </svg>
  ),
  ellipse: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="7.5" />
    </svg>
  ),
};

interface ToolbarProps {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
  onGenerate: (prompt: string) => void;
  generating: boolean;
  error: string | null;
}

export function Toolbar({ activeTool, onSelectTool, onGenerate, generating, error }: ToolbarProps) {
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;
    onGenerate(prompt);
    setPrompt('');
  };

  return (
    <aside
      aria-label="Панель инструментов"
      className="relative flex w-14 flex-col items-center gap-2 border-r border-zinc-800 bg-surface py-3"
    >
      {TOOLS.map((tool) => {
        const active = tool.id === activeTool;
        return (
          <button
            key={tool.id}
            type="button"
            aria-label={`${tool.label} (${tool.hotkey})`}
            aria-pressed={active}
            title={`${tool.label} (${tool.hotkey})`}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              active
                ? 'bg-blue-500 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
            onClick={() => onSelectTool(tool.id)}
          >
            {TOOL_ICONS[tool.id]}
          </button>
        );
      })}

      <div className="my-1 h-px w-6 bg-zinc-800" />

      <button
        type="button"
        aria-label="Сгенерировать картинку"
        aria-expanded={open}
        title="AI image"
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          open
            ? 'bg-blue-500 text-white'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3z" />
          <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />
        </svg>
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute left-14 top-3 z-10 flex w-80 flex-col gap-2 rounded-lg border border-zinc-800 bg-surface-2 p-3 shadow-xl"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            AI image
          </div>
          <input
            autoFocus
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image..."
            className="w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className="rounded-md bg-blue-500 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
          <p className="text-[10px] leading-snug text-zinc-500">
            Промпт и перевод уходят на сторонние сервисы: pollinations.ai и mymemory.translated.net.
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </aside>
  );
}