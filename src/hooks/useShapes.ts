import { useCallback, useEffect, useRef, useState } from 'react';
import type { Point, ResizeHandle, Shape, ShapeKind } from '../types/shape';
import { DEFAULT_FILL, DEFAULT_SHAPE_SIZE, IMAGE_CASCADE_STEP, IMAGE_CASCADE_STEPS, IMAGE_SIZE } from '../constants/tools';
import { screenToCanvas, subtractPoint } from '../utils/geometry';
import { uid } from '../utils/id';
import { loadDocument, saveDocument, scheduleSave } from '../utils/storage';
import type { Viewport } from '../utils/geometry';

interface DragState {
  id: string;
  offset: Point;
}

interface ScaleState {
  id: string;
  handle: ResizeHandle;
  start: { x: number; y: number; width: number; height: number };
}

const MIN_SIZE = 16;
const HISTORY_LIMIT = 100;
const EDIT_COALESCE_MS = 600;

interface History {
  past: Shape[][];
  future: Shape[][];
}

interface Document {
  shapes: Shape[];
  history: History;
}

const EMPTY_HISTORY: History = { past: [], future: [] };

function sameShape(a: Shape, b: Shape): boolean {
  return (
    a.id === b.id &&
    a.kind === b.kind &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.fill === b.fill &&
    a.src === b.src
  );
}

function sameShapes(a: Shape[], b: Shape[]): boolean {
  return a.length === b.length && a.every((shape, index) => sameShape(shape, b[index]));
}

function pushHistory(history: History, snapshot: Shape[]): History {
  return { past: [...history.past, snapshot].slice(-HISTORY_LIMIT), future: [] };
}

export interface UseShapesResult {
  shapes: Shape[];
  selectedId: string | null;
  draft: Shape | null;
  updateShape: (id: string, patch: Partial<Omit<Shape, 'id'>>) => void;
  removeShape: (id: string) => void;
  select: (id: string | null) => void;
  addImage: (src: string, center: Point) => void;
  drawStart: (kind: ShapeKind, point: Point, viewport: Viewport) => void;
  drawUpdate: (point: Point, viewport: Viewport) => void;
  drawEnd: () => void;
  drawCancel: () => void;
  dragStart: (id: string, point: Point, viewport: Viewport) => void;
  dragMove: (point: Point, viewport: Viewport) => void;
  dragEnd: () => void;
  scaleStart: (id: string, handle: ResizeHandle) => void;
  scaleMove: (point: Point, viewport: Viewport) => void;
  scaleEnd: () => void;
  undo: () => void;
  redo: () => void;
}

function normalize(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

function resizeRect(
  start: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  cursor: Point,
) {
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  let { x, y, width, height } = start;

  if (handle.includes('e')) width = Math.max(MIN_SIZE, cursor.x - x);
  if (handle.includes('s')) height = Math.max(MIN_SIZE, cursor.y - y);

  if (handle.includes('w')) {
    const nextWidth = Math.max(MIN_SIZE, right - cursor.x);
    x = right - nextWidth;
    width = nextWidth;
  }
  if (handle.includes('n')) {
    const nextHeight = Math.max(MIN_SIZE, bottom - cursor.y);
    y = bottom - nextHeight;
    height = nextHeight;
  }

  return { x, y, width, height };
}

export function useShapes(initial: Shape[], docKey: string, onSaved?: () => void): UseShapesResult {
  const [restored] = useState(() => loadDocument(docKey, initial));
  const onSavedRef = useRef(onSaved);
  const [document_, setDocument] = useState<Document>(() => ({
    shapes: restored.shapes,
    history: EMPTY_HISTORY,
  }));
  const [selectedId, setSelectedId] = useState<string | null>(restored.selectedId);
  const [draft, setDraft] = useState<Shape | null>(null);

  const shapes = document_.shapes;
  const shapesRef = useRef(shapes);
  const drawAnchorRef = useRef<Point | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const scaleRef = useRef<ScaleState | null>(null);
  const editRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    scheduleSave(docKey, () => {
      saveDocument(docKey, { shapes, selectedId });
      onSavedRef.current?.();
    });
  }, [docKey, shapes, selectedId]);

  useEffect(() => {
    setSelectedId((prev) => (prev && !shapes.some((shape) => shape.id === prev) ? null : prev));
  }, [shapes]);

  const applyShapes = useCallback(
    (updater: (prev: Shape[]) => Shape[], record: boolean) => {
      setDocument((prev) => {
        const next = updater(prev.shapes);
        if (!record || sameShapes(prev.shapes, next)) return { ...prev, shapes: next };
        return { shapes: next, history: pushHistory(prev.history, prev.shapes) };
      });
    },
    [],
  );

  // Перетаскивание и ресайз: снимок состояния один раз на жест, а не на каждый кадр
  const beginContinuousEdit = useCallback(() => {
    editRef.current = null;
    setDocument((prev) => ({ ...prev, history: pushHistory(prev.history, prev.shapes) }));
  }, []);

  const endContinuousEdit = useCallback(() => {
    editRef.current = null;
    setDocument((prev) => {
      const past = prev.history.past;
      const last = past[past.length - 1];
      if (past.length === 0 || !last || !sameShapes(last, prev.shapes)) return prev;
      return { ...prev, history: { ...prev.history, past: past.slice(0, -1) } };
    });
  }, []);

  const undo = useCallback(() => {
    setDocument((prev) => {
      const { past, future } = prev.history;
      if (past.length === 0) return prev;
      return { shapes: past[past.length - 1], history: { past: past.slice(0, -1), future: [prev.shapes, ...future] } };
    });
  }, []);

  const redo = useCallback(() => {
    setDocument((prev) => {
      const { past, future } = prev.history;
      if (future.length === 0) return prev;
      return { shapes: future[0], history: { past: [...past, prev.shapes].slice(-HISTORY_LIMIT), future: future.slice(1) } };
    });
  }, []);

  const updateShape = useCallback(
    (id: string, patch: Partial<Omit<Shape, 'id'>>) => {
      const now = Date.now();
      const key = `${id}:${Object.keys(patch).sort().join(',')}`;
      const previousEdit = editRef.current;
      const isSameBurst = previousEdit !== null && previousEdit.key === key && now - previousEdit.at < EDIT_COALESCE_MS;
      editRef.current = { key, at: now };
      applyShapes(
        (prev) => prev.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape)),
        !isSameBurst,
      );
    },
    [applyShapes],
  );

  const removeShape = useCallback(
    (id: string) => {
      applyShapes((prev) => prev.filter((shape) => shape.id !== id), true);
      setSelectedId((prev) => (prev === id ? null : prev));
    },
    [applyShapes],
  );

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const addImage = useCallback(
    (src: string, center: Point) => {
      const generated = shapesRef.current.filter((shape) => shape.kind === 'image').length;
      const step = (generated % IMAGE_CASCADE_STEPS) * IMAGE_CASCADE_STEP;
      const shape: Shape = {
        id: uid(),
        kind: 'image',
        x: Math.round(center.x - IMAGE_SIZE / 2 + step),
        y: Math.round(center.y - IMAGE_SIZE / 2 + step),
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        fill: '#ffffff',
        src,
      };
      applyShapes((prev) => [...prev, shape], true);
      setSelectedId(shape.id);
    },
    [applyShapes],
  );

  const drawStart = useCallback((kind: ShapeKind, point: Point, viewport: Viewport) => {
    // Начало черновика держим в экранных координатах: если во время рисования
    // изменить зум, геометрия не «уедет» — начало пересчитается от живого вьюпорта.
    drawAnchorRef.current = point;
    const canvas = screenToCanvas(point, viewport);
    setDraft({
      id: uid(),
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
    const anchor = drawAnchorRef.current;
    if (!anchor) return;
    const start = screenToCanvas(anchor, viewport);
    const canvas = screenToCanvas(point, viewport);
    setDraft((prev) => (prev ? { ...prev, ...normalize(start.x, start.y, canvas.x, canvas.y) } : prev));
  }, []);

  const drawEnd = useCallback(() => {
    drawAnchorRef.current = null;
    if (!draft) return;
    const shape =
      draft.width === 0 && draft.height === 0
        ? { ...draft, width: DEFAULT_SHAPE_SIZE, height: DEFAULT_SHAPE_SIZE }
        : draft;
    applyShapes((prev) => [...prev, shape], true);
    setSelectedId(shape.id);
    setDraft(null);
  }, [applyShapes, draft]);

  const drawCancel = useCallback(() => {
    drawAnchorRef.current = null;
    setDraft(null);
  }, []);

  const dragStart = useCallback(
    (id: string, point: Point, viewport: Viewport) => {
      const shape = shapesRef.current.find((s) => s.id === id);
      if (!shape) return;
      const cursor = screenToCanvas(point, viewport);
      dragRef.current = {
        id,
        offset: subtractPoint(cursor, { x: shape.x, y: shape.y }),
      };
      beginContinuousEdit();
    },
    [beginContinuousEdit],
  );

  const dragMove = useCallback(
    (point: Point, viewport: Viewport) => {
      const drag = dragRef.current;
      if (!drag) return;
      const cursor = screenToCanvas(point, viewport);
      const position = subtractPoint(cursor, drag.offset);
      applyShapes(
        (prev) => prev.map((shape) => (shape.id === drag.id ? { ...shape, ...position } : shape)),
        false,
      );
    },
    [applyShapes],
  );

  const dragEnd = useCallback(() => {
    dragRef.current = null;
    endContinuousEdit();
  }, [endContinuousEdit]);

  const scaleStart = useCallback(
    (id: string, handle: ResizeHandle) => {
      const shape = shapesRef.current.find((s) => s.id === id);
      if (!shape) return;
      scaleRef.current = {
        id,
        handle,
        start: { x: shape.x, y: shape.y, width: shape.width, height: shape.height },
      };
      beginContinuousEdit();
    },
    [beginContinuousEdit],
  );

  const scaleMove = useCallback(
    (point: Point, viewport: Viewport) => {
      const scale = scaleRef.current;
      if (!scale) return;
      const cursor = screenToCanvas(point, viewport);
      const rect = resizeRect(scale.start, scale.handle, cursor);
      applyShapes(
        (prev) => prev.map((shape) => (shape.id === scale.id ? { ...shape, ...rect } : shape)),
        false,
      );
    },
    [applyShapes],
  );

  const scaleEnd = useCallback(() => {
    scaleRef.current = null;
    endContinuousEdit();
  }, [endContinuousEdit]);

  return {
    shapes,
    selectedId,
    draft,
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
    scaleStart,
    scaleMove,
    scaleEnd,
    undo,
    redo,
  };
}
