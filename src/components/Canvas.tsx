import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { Point, ResizeHandle, Shape as ShapeModel, ShapeKind, Tool } from '../types/shape';
import type { Camera } from '../hooks/useViewport';
import type { Viewport } from '../utils/geometry';
import { Shape } from './Shape';

const GRID_SIZE = 24;

interface CanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
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
  onScaleStart: (id: string, handle: ResizeHandle) => void;
  onScaleMove: (point: Point, viewport: Viewport) => void;
  onScaleEnd: () => void;
}

export function Canvas({
  containerRef,
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
  onScaleStart,
  onScaleMove,
  onScaleEnd,
}: CanvasProps) {
  const drawingRef = useRef(false);

  const isShapeTool = tool === 'rectangle' || tool === 'ellipse';
  const shapesInteractive = tool === 'select' && !camera.isSpaceDown;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!camera.isRestored) {
      camera.centerOn({ x: el.clientWidth / 2, y: el.clientHeight / 2 });
    }

    let size = { width: el.clientWidth, height: el.clientHeight };
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      camera.panBy((width - size.width) / 2, (height - size.height) / 2);
      size = { width, height };
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [camera.isRestored, camera.centerOn, camera.panBy]);

  const toLocalPoint = (e: ReactPointerEvent<HTMLElement>): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
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

  const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    drawingRef.current = false;
    camera.panHandlers.onPointerUp(e);
    onDrawCancel();
  };

  const gridSize = GRID_SIZE * camera.viewport.zoom;

  const shapeHandlers = {
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onScaleStart,
    onScaleMove,
    onScaleEnd,
    toLocalPoint,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-canvas"
      style={{
        cursor: camera.isSpaceDown ? 'grab' : isShapeTool ? 'crosshair' : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--color-accent) 14%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 14%, transparent) 1px, transparent 1px)',
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
          interactive={shapesInteractive}
          {...shapeHandlers}
        />
      ))}
      {draft && (
        <Shape
          shape={draft}
          viewport={camera.viewport}
          selected={false}
          interactive={false}
          {...shapeHandlers}
        />
      )}
    </div>
  );
}