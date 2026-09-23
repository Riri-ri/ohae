import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LayersPanel } from './components/LayersPanel';
import { Toolbar } from './components/Toolbar';
import { DEFAULT_TOOL } from './constants/tools';
import { useHotkeys } from './hooks/useHotkeys';
import { useShapes } from './hooks/useShapes';
import { useViewport } from './hooks/useViewport';
import { buildImageUrl, hasCyrillic, preloadImage, translateToEnglish } from './utils/aiImage';
import type { Shape, Tool } from './types/shape';

const STARTER_SHAPES: Shape[] = [
  { id: 'starter-rect', kind: 'rectangle', x: -120, y: -64, width: 240, height: 128, fill: '#7c6cff' },
  { id: 'starter-ellipse', kind: 'ellipse', x: -60, y: 96, width: 120, height: 120, fill: '#4da3ff' },
];

export default function App() {
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL);
  const camera = useViewport();
  const {
    shapes,
    selectedId,
    draft,
    updateShape,
    removeShape,
    select,
    drawStart,
    drawUpdate,
    drawEnd,
    drawCancel,
    dragStart,
    dragMove,
    dragEnd,
    addImage,
  } = useShapes(STARTER_SHAPES);

  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useHotkeys({
    onSelectTool: (t) => setTool(t),
    onDelete: () => {
      if (selectedId) removeShape(selectedId);
    },
  });

  const handleGenerate = async (rawPrompt: string) => {
    const trimmed = rawPrompt.trim();
    if (!trimmed) return;
    setGenerating(true);
    setAiError(null);
    try {
      let prompt = hasCyrillic(trimmed) ? await translateToEnglish(trimmed) : trimmed;
      if (!prompt.trim()) prompt = trimmed;
      const src = buildImageUrl(prompt);
      await preloadImage(src);
      addImage(src);
    } catch {
      setAiError('Could not generate the image. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const selectedShape = selectedId ? shapes.find((shape) => shape.id === selectedId) ?? null : null;

  const handleUpdate = (patch: Partial<Omit<Shape, 'id'>>) => {
    if (selectedId) updateShape(selectedId, patch);
  };

  return (
    <div className="flex h-full w-full bg-[#0d0f14] text-zinc-100">
      <Toolbar activeTool={tool} onSelectTool={setTool} onGenerate={handleGenerate} generating={generating} error={aiError} />
      <Canvas
        camera={camera}
        tool={tool}
        shapes={shapes}
        selectedId={selectedId}
        draft={draft}
        onSelect={select}
        onDrawStart={drawStart}
        onDrawUpdate={drawUpdate}
        onDrawEnd={drawEnd}
        onDrawCancel={drawCancel}
        onDragStart={dragStart}
        onDragMove={dragMove}
        onDragEnd={dragEnd}
      />
      <div className="flex h-full w-64 flex-col overflow-hidden border-l border-zinc-800 bg-[#14161c]">
        <PropertiesPanel shape={selectedShape} onUpdate={handleUpdate} />
        <LayersPanel shapes={shapes} selectedId={selectedId} onSelect={select} />
      </div>
    </div>
  );
}