import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Point, Shape as ShapeModel, ShapeKind, Tool } from '../types/shape';
import type { Camera } from '../hooks/useViewport';
import type { Viewport } from '../utils/geometry';
import { Shape } from './Shape';

const GRID_SIZE = 24;

interface CanvasProps {
  camera: Camera;
  tool: Tool;
  shapes: ShapeModel[];
  selectedId: string | null;
  draft: ShapeModel | null;
  onSelect: (id: string | null) => void;
  onDrawStart: (kind: ShapeKind, point: Point, viewport: Viewport) => void;
  onDrawUpdate: (point: Point, viewport: Viewport) => void;
  onDrawEnd: () => void;
  onDrawCancel: () => void;
  onDragStart: (id: string, point: Point, viewport: Viewport) => void;
  onDragMove: (point: Point, viewport: Viewport) => void;
  onDragEnd: () => void;
}

export function Canvas({
  camera,
  tool,
  shapes,
  selectedId,
  draft,
  onSelect,
  onDrawStart,
  onDrawUpdate,
  onDrawEnd,
  onDrawCancel,
  onDragStart,
  onDragMove,
  onDragEnd,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);

  const isShapeTool = tool === 'rectangle' || tool === 'ellipse';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    camera.centerOn({ x: el.clientWidth / 2, y: el.clientHeight / 2 });
  }, [camera.centerOn]);

  const toLocalPoint = (e: ReactPointerEvent<HTMLElement>): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    camera.panHandlers.onPointerDown(e);
    if (camera.isSpaceDown) return;
    if (isShapeTool) {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      onDrawStart(tool, toLocalPoint(e), camera.viewport);
    } else if (tool === 'select') {
      onSelect(null);
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    camera.panHandlers.onPointerMove(e);
    if (drawingRef.current && !camera.isSpaceDown) {
      onDrawUpdate(toLocalPoint(e), camera.viewport);
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    camera.panHandlers.onPointerUp(e);
    if (drawingRef.current) {
      drawingRef.current = false;
      onDrawEnd();
    }
  };

  const handlePointerCancel = () => {
    drawingRef.current = false;
    onDrawCancel();
  };

  const gridSize = GRID_SIZE * camera.viewport.zoom;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-[#1c1f26]"
      style={{ cursor: camera.isSpaceDown ? 'grab' : 'default' }}
      data-tool={tool}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(77, 163, 255, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 255, 0.14) 1px, transparent 1px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${camera.viewport.x}px ${camera.viewport.y}px`,
        }}
      />
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          shape={shape}
          viewport={camera.viewport}
          selected={shape.id === selectedId}
          draggable={!camera.isSpaceDown}
          onSelect={onSelect}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          toLocalPoint={toLocalPoint}
        />
      ))}
      {draft && (
        <Shape
          shape={draft}
          viewport={camera.viewport}
          selected={false}
          draggable={false}
          onSelect={onSelect}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          toLocalPoint={toLocalPoint}
        />
      )}
    </div>
  );
}