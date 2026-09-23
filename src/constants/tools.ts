import type { Tool } from '../types/shape';

export interface ToolDefinition {
  id: Tool;
  label: string;
  hotkey: string;
}

export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Move', hotkey: 'V' },
  { id: 'rectangle', label: 'Rectangle', hotkey: 'R' },
  { id: 'ellipse', label: 'Ellipse', hotkey: 'O' },
];

export const HOTKEY_TO_TOOL: Record<string, Tool> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
};

export const DEFAULT_TOOL: Tool = 'select';

export const DEFAULT_FILL = '#4da3ff';

export const DEFAULT_SHAPE_SIZE = 120;
