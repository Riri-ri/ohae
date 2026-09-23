import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Point, Shape as ShapeModel } from '../types/shape';
import type { Viewport } from '../utils/geometry';
import { canvasToScreen } from '../utils/geometry';

const FRAME_PADDING = 5;
const MARKER_SIZE = 9;
const MARKER_COLOR = '#4da3ff';

const MARKER_POSITIONS = [
  { left: 0, top: 0 },
  { left: 50, top: 0 },
  { left: 100, top: 0 },
  { left: 0, top: 50 },
  { left: 100, top: 50 },
  { left: 0, top: 100 },
  { left: 50, top: 100 },
  { left: 100, top: 100 },
];

interface ShapeProps {
  shape: ShapeModel;
  viewport: Viewport;
  selected: boolean;
  draggable: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, point: Point, viewport: Viewport) => void;
  onDragMove: (point: Point, viewport: Viewport) => void;
  onDragEnd: () => void;
  toLocalPoint: (e: ReactPointerEvent<HTMLElement>) => Point;
}

export function Shape({
  shape,
  viewport,
  selected,
  draggable,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  toLocalPoint,
}: ShapeProps) {
  const origin = canvasToScreen({ x: shape.x, y: shape.y }, viewport);
  const draggingRef = useRef(false);

  const width = shape.width * viewport.zoom;
  const height = shape.height * viewport.zoom;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect(shape.id);
    if (draggable) {
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      onDragStart(shape.id, toLocalPoint(e), viewport);
    }
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

  return (
    <div
      data-shape-id={shape.id}
      className="absolute"
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
        cursor: draggable ? 'move' : 'default',
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
          {MARKER_POSITIONS.map((position, index) => (
            <div
              key={index}
              className="absolute rounded-[2px]"
              style={{
                left: `${position.left}%`,
                top: `${position.top}%`,
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                backgroundColor: '#ffffff',
                border: `1.5px solid ${MARKER_COLOR}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}