import { useCallback, useEffect, useRef, useState } from 'react';
import type { Point, Shape, ShapeKind } from '../types/shape';
import { DEFAULT_FILL, DEFAULT_SHAPE_SIZE } from '../constants/tools';
import { screenToCanvas, subtractPoint } from '../utils/geometry';
import type { Viewport } from '../utils/geometry';

interface DragState {
  id: string;
  offset: Point;
}

export interface UseShapesResult {
  shapes: Shape[];
  selectedId: string | null;
  draft: Shape | null;
  addShape: (kind: ShapeKind, x: number, y: number) => void;
  updateShape: (id: string, patch: Partial<Omit<Shape, 'id'>>) => void;
  removeShape: (id: string) => void;
  select: (id: string | null) => void;
  addImage: (src: string) => void;
  drawStart: (kind: ShapeKind, point: Point, viewport: Viewport) => void;
  drawUpdate: (point: Point, viewport: Viewport) => void;
  drawEnd: () => void;
  drawCancel: () => void;
  dragStart: (id: string, point: Point, viewport: Viewport) => void;
  dragMove: (point: Point, viewport: Viewport) => void;
  dragEnd: () => void;
}

function normalize(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function useShapes(initial: Shape[] = []): UseShapesResult {
  const [shapes, setShapes] = useState<Shape[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Shape | null>(null);

  const shapesRef = useRef(shapes);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  const addShape = useCallback((kind: ShapeKind, x: number, y: number) => {
    const shape: Shape = {
      id: crypto.randomUUID(),
      kind,
      x,
      y,
      width: DEFAULT_SHAPE_SIZE,
      height: DEFAULT_SHAPE_SIZE,
      fill: DEFAULT_FILL,
    };
    setShapes((prev) => [...prev, shape]);
    setSelectedId(shape.id);
  }, []);

  const updateShape = useCallback((id: string, patch: Partial<Omit<Shape, 'id'>>) => {
    setShapes((prev) => prev.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape)));
  }, []);

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((shape) => shape.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const addImage = useCallback((src: string) => {
    const shape: Shape = {
      id: crypto.randomUUID(),
      kind: 'image',
      x: -128,
      y: -128,
      width: 256,
      height: 256,
      fill: '#ffffff',
      src,
    };
    setShapes((prev) => [...prev, shape]);
    setSelectedId(shape.id);
  }, []);

  const drawStart = useCallback((kind: ShapeKind, point: Point, viewport: Viewport) => {
    const canvas = screenToCanvas(point, viewport);
    setDraft({
      id: crypto.randomUUID(),
      kind,
      x: canvas.x,
      y: canvas.y,
      width: 0,
      height: 0,
      fill: DEFAULT_FILL,
    });
    setSelectedId(null);
  }, []);

  const drawUpdate = useCallback((point: Point, viewport: Viewport) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const canvas = screenToCanvas(point, viewport);
      return { ...prev, ...normalize(prev.x, prev.y, canvas.x, canvas.y) };
    });
  }, []);

  const drawEnd = useCallback(() => {
    if (!draft) return;
    const shape =
      draft.width === 0 && draft.height === 0
        ? { ...draft, width: DEFAULT_SHAPE_SIZE, height: DEFAULT_SHAPE_SIZE }
        : draft;
    setShapes((prev) => [...prev, shape]);
    setSelectedId(shape.id);
    setDraft(null);
  }, [draft]);

  const drawCancel = useCallback(() => {
    setDraft(null);
  }, []);

  const dragStart = useCallback((id: string, point: Point, viewport: Viewport) => {
    const shape = shapesRef.current.find((s) => s.id === id);
    if (!shape) return;
    const cursor = screenToCanvas(point, viewport);
    dragRef.current = {
      id,
      offset: subtractPoint(cursor, { x: shape.x, y: shape.y }),
    };
  }, []);

  const dragMove = useCallback((point: Point, viewport: Viewport) => {
    const drag = dragRef.current;
    if (!drag) return;
    const cursor = screenToCanvas(point, viewport);
    const position = subtractPoint(cursor, drag.offset);
    setShapes((prev) =>
      prev.map((shape) => (shape.id === drag.id ? { ...shape, ...position } : shape)),
    );
  }, []);

  const dragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  return {
    shapes,
    selectedId,
    draft,
    addShape,
    updateShape,
    removeShape,
    select,
    addImage,
    drawStart,
    drawUpdate,
    drawEnd,
    drawCancel,
    dragStart,
    dragMove,
    dragEnd,
  };
}
