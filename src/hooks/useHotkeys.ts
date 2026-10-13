import { useEffect } from 'react';
import type { Tool } from '../types/shape';
import { HOTKEY_TO_TOOL } from '../constants/tools';
import { isEditableTarget } from '../utils/dom';

export interface HotkeyHandlers {
  onSelectTool: (tool: Tool) => void;
  onDelete: () => void;
  onEscape: () => void;
  onUndo: () => void;
  onRedo: () => void;
  /** Есть ли что удалять — иначе не перехватываем Backspace, чтобы работала навигация браузера. */
  canDelete: boolean;
}

export function useHotkeys({
  onSelectTool,
  onDelete,
  onEscape,
  onUndo,
  onRedo,
  canDelete,
}: HotkeyHandlers): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      if (e.key === 'Escape') {
        onEscape();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }

      const tool = toolFromEvent(e);
      if (tool) {
        onSelectTool(tool);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!canDelete) return;
        e.preventDefault();
        onDelete();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSelectTool, onDelete, onEscape, onUndo, onRedo, canDelete]);
}

function toolFromEvent(e: KeyboardEvent): Tool | undefined {
  if (e.code.startsWith('Key')) {
    const letter = e.code.slice(3).toLowerCase();
    const tool = HOTKEY_TO_TOOL[letter];
    if (tool) return tool;
  }
  return HOTKEY_TO_TOOL[e.key.toLowerCase()];
}
