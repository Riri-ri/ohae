import { useEffect } from 'react';
import type { Tool } from '../types/shape';
import { HOTKEY_TO_TOOL } from '../constants/tools';

export interface HotkeyHandlers {
  onSelectTool: (tool: Tool) => void;
  onDelete: () => void;
}

export function useHotkeys({ onSelectTool, onDelete }: HotkeyHandlers): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const tool = toolFromEvent(e);
      if (tool) {
        onSelectTool(tool);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSelectTool, onDelete]);
}

function toolFromEvent(e: KeyboardEvent): Tool | undefined {
  if (e.code.startsWith('Key')) {
    const letter = e.code.slice(3).toLowerCase();
    const tool = HOTKEY_TO_TOOL[letter];
    if (tool) return tool;
  }
  return HOTKEY_TO_TOOL[e.key.toLowerCase()];
}
