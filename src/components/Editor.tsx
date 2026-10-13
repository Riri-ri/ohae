import { useCallback, useRef, useState } from 'react';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { Toolbar } from './Toolbar';
import { DEFAULT_TOOL } from '../constants/tools';
import { useHotkeys } from '../hooks/useHotkeys';
import { useShapes } from '../hooks/useShapes';
import { useViewport } from '../hooks/useViewport';
import { buildImageUrl, hasCyrillic, preloadImage, translateToEnglish } from '../utils/aiImage';
import { screenToCanvas } from '../utils/geometry';
import { projectDocumentKey, projectViewportKey } from '../utils/storage';
import type { Point, Shape, Tool } from '../types/shape';

interface EditorProps {
  projectId: string;
  onSaved?: () => void;
}

export function Editor({ projectId, onSaved }: EditorProps) {
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL);
  const [panelOpen, setPanelOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const camera = useViewport(canvasRef, projectViewportKey(projectId));
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
    scaleStart,
    scaleMove,
    scaleEnd,
    addImage,
    undo,
    redo,
  } = useShapes([], projectDocumentKey(projectId), onSaved);

  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSelectTool = useCallback((next: Tool) => setTool(next), []);
  const handleDelete = useCallback(() => {
    if (selectedId) removeShape(selectedId);
  }, [removeShape, selectedId]);
  const handleEscape = useCallback(() => {
    drawCancel();
    select(null);
    setTool(DEFAULT_TOOL);
  }, [drawCancel, select]);

  useHotkeys({
    onSelectTool: handleSelectTool,
    onDelete: handleDelete,
    onEscape: handleEscape,
    onUndo: undo,
    onRedo: redo,
    canDelete: selectedId !== null,
  });

  const handleDrawEnd = useCallback(() => {
    drawEnd();
    setTool(DEFAULT_TOOL);
  }, [drawEnd]);

  const viewportCenter = useCallback((): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToCanvas({ x: rect.width / 2, y: rect.height / 2 }, camera.viewport);
  }, [camera.viewport]);

  const handleGenerate = useCallback(
    async (rawPrompt: string) => {
      const trimmed = rawPrompt.trim();
      if (!trimmed) return;
      setGenerating(true);
      setAiError(null);
      try {
        let prompt = hasCyrillic(trimmed) ? await translateToEnglish(trimmed) : trimmed;
        if (!prompt.trim()) prompt = trimmed;
        const src = buildImageUrl(prompt);
        await preloadImage(src);
        addImage(src, viewportCenter());
      } catch {
        setAiError('Не удалось сгенерировать картинку. Попробуйте ещё раз.');
      } finally {
        setGenerating(false);
      }
    },
    [addImage, viewportCenter],
  );

  const selectedShape = selectedId ? shapes.find((shape) => shape.id === selectedId) ?? null : null;

  const handleUpdate = useCallback(
    (patch: Partial<Omit<Shape, 'id'>>) => {
      if (selectedId) updateShape(selectedId, patch);
    },
    [selectedId, updateShape],
  );

  return (
    <div className="relative flex h-full min-h-0 w-full">
      <Toolbar
        activeTool={tool}
        onSelectTool={setTool}
        onGenerate={handleGenerate}
        generating={generating}
        error={aiError}
      />
      <Canvas
        containerRef={canvasRef}
        camera={camera}
        tool={tool}
        shapes={shapes}
        selectedId={selectedId}
        draft={draft}
        onSelect={select}
        onDrawStart={drawStart}
        onDrawUpdate={drawUpdate}
        onDrawEnd={handleDrawEnd}
        onDrawCancel={drawCancel}
        onDragStart={dragStart}
        onDragMove={dragMove}
        onDragEnd={dragEnd}
        onScaleStart={scaleStart}
        onScaleMove={scaleMove}
        onScaleEnd={scaleEnd}
      />

      {panelOpen && (
        <button
          type="button"
          aria-label="Закрыть панель свойств"
          className="absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <div
        className={`absolute inset-y-0 right-0 z-30 w-64 flex-col overflow-hidden border-l border-zinc-800 bg-surface md:static md:z-auto ${
          panelOpen ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Панель</span>
          <button
            type="button"
            className="text-xs text-zinc-400 hover:text-zinc-100"
            onClick={() => setPanelOpen(false)}
          >
            Закрыть
          </button>
        </div>
        <PropertiesPanel shape={selectedShape} onUpdate={handleUpdate} />
        <LayersPanel shapes={shapes} selectedId={selectedId} onSelect={select} />
      </div>

      <button
        type="button"
        className="absolute bottom-4 right-4 z-10 rounded-full bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-lg md:hidden"
        onClick={() => setPanelOpen(true)}
      >
        Свойства и слои
      </button>
    </div>
  );
}
