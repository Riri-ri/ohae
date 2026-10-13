import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Point, ResizeHandle, Shape as ShapeModel } from '../types/shape';
import type { Viewport } from '../utils/geometry';
import { canvasToScreen } from '../utils/geometry';

const FRAME_PADDING = 5;
const MARKER_SIZE = 9;
const MARKER_COLOR = 'var(--color-accent)';

const MARKER_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

const HANDLE_CURSOR: Record<ResizeHandle, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  w: 'ew-resize',
  e: 'ew-resize',
  sw: 'nesw-resize',
  s: 'ns-resize',
  se: 'nwse-resize',
};

const HANDLE_POSITIONS: Record<ResizeHandle, { left: number; top: number }> = {
  nw: { left: 0, top: 0 },
  n: { left: 50, top: 0 },
  ne: { left: 100, top: 0 },
  w: { left: 0, top: 50 },
  e: { left: 100, top: 50 },
  sw: { left: 0, top: 100 },
  s: { left: 50, top: 100 },
  se: { left: 100, top: 100 },
};

interface ShapeProps {
  shape: ShapeModel;
  viewport: Viewport;
  selected: boolean;
  interactive: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, point: Point, viewport: Viewport) => void;
  onDragMove: (point: Point, viewport: Viewport) => void;
  onDragEnd: () => void;
  onScaleStart: (id: string, handle: ResizeHandle) => void;
  onScaleMove: (point: Point, viewport: Viewport) => void;
  onScaleEnd: () => void;
  toLocalPoint: (e: ReactPointerEvent<HTMLElement>) => Point;
}

export function Shape({
  shape,
  viewport,
  selected,
  interactive,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onScaleStart,
  onScaleMove,
  onScaleEnd,
  toLocalPoint,
}: ShapeProps) {
  const origin = canvasToScreen({ x: shape.x, y: shape.y }, viewport);
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);

  const width = shape.width * viewport.zoom;
  const height = shape.height * viewport.zoom;
  // На маленьких фигурах хендлы не должны наезжать друг на друга.
  const markerSize = Math.min(MARKER_SIZE, Math.max(6, Math.min(width, height) / 3));

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || e.button !== 0) return;
    e.stopPropagation();
    onSelect(shape.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    onDragStart(shape.id, toLocalPoint(e), viewport);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    onDragMove(toLocalPoint(e), viewport);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    draggingRef.current = false;
    onDragEnd();
  };

  const handlePointerCancel = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onDragEnd();
  };

  const handleResizeStart = (handle: ResizeHandle, e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || e.button !== 0) return;
    onSelect(shape.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    resizingRef.current = true;
    onScaleStart(shape.id, handle);
  };

  const handleResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    onScaleMove(toLocalPoint(e), viewport);
  };

  const handleResizeEnd = (_e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    onScaleEnd();
  };

  const handleResizeCancel = (_e?: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    onScaleEnd();
  };

  return (
    <div
      data-shape-id={shape.id}
      className="absolute"
      role={shape.kind === 'image' ? 'img' : undefined}
      aria-label={shape.kind === 'image' ? 'Изображение на холсте' : undefined}
      style={{
        left: origin.x,
        top: origin.y,
        width,
        height,
        backgroundColor: shape.kind === 'image' ? 'transparent' : shape.fill,
        backgroundImage: shape.src ? `url("${shape.src}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: shape.kind === 'ellipse' ? '9999px' : '4px',
        cursor: interactive ? 'move' : 'inherit',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {selected && (
        <div
          className="pointer-events-none absolute"
          style={{ inset: -FRAME_PADDING, border: `1.5px solid ${MARKER_COLOR}` }}
        >
          {MARKER_HANDLES.map((handle) => (
            <div
              key={handle}
              role="presentation"
              className="pointer-events-auto absolute rounded-[2px]"
              style={{
                left: `${HANDLE_POSITIONS[handle].left}%`,
                top: `${HANDLE_POSITIONS[handle].top}%`,
                width: markerSize,
                height: markerSize,
                backgroundColor: '#ffffff',
                border: `1.5px solid ${MARKER_COLOR}`,
                transform: 'translate(-50%, -50%)',
                cursor: interactive ? HANDLE_CURSOR[handle] : 'default',
                touchAction: 'none',
              }}
              onPointerDown={(e) => handleResizeStart(handle, e)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}