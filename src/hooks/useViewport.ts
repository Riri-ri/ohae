import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { Point } from '../types/shape';
import { clampZoom, screenToCanvas } from '../utils/geometry';
import type { Viewport } from '../utils/geometry';
import { isInteractiveTarget } from '../utils/dom';
import { loadViewport, saveViewport, scheduleSave } from '../utils/storage';

const WHEEL_ZOOM_SENSITIVITY = 0.002;

export interface Camera {
  viewport: Viewport;
  isSpaceDown: boolean;
  isRestored: boolean;
  centerOn: (center: Point) => void;
  panBy: (dx: number, dy: number) => void;
  panHandlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  };
}

export function useViewport(containerRef: RefObject<HTMLDivElement | null>, viewportKey: string): Camera {
  const [restored] = useState(() => loadViewport(viewportKey));
  const [viewport, setViewport] = useState<Viewport>(() => restored ?? { x: 0, y: 0, zoom: 1 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  const spaceRef = useRef(false);
  const panningRef = useRef(false);
  const lastPointerRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    scheduleSave(viewportKey, () => saveViewport(viewportKey, viewport));
  }, [viewportKey, viewport]);

  const centerOn = useCallback((center: Point) => {
    setViewport((v) => ({ ...v, x: center.x, y: center.y }));
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const zoomAt = useCallback((localPoint: Point, factor: number) => {
    setViewport((v) => {
      const zoom = clampZoom(v.zoom * factor);
      const canvas = screenToCanvas(localPoint, v);
      return {
        zoom,
        x: localPoint.x - canvas.x * zoom,
        y: localPoint.y - canvas.y * zoom,
      };
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (isInteractiveTarget(e.target)) return;
      e.preventDefault();
      spaceRef.current = true;
      setIsSpaceDown(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      spaceRef.current = false;
      panningRef.current = false;
      setIsSpaceDown(false);
    };
    const onBlur = () => {
      spaceRef.current = false;
      panningRef.current = false;
      setIsSpaceDown(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
        Math.exp(-e.deltaY * WHEEL_ZOOM_SENSITIVITY),
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef, zoomAt]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!spaceRef.current || e.button !== 0) return;
    panningRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!panningRef.current) return;
      const next = { x: e.clientX, y: e.clientY };
      const last = lastPointerRef.current;
      panBy(next.x - last.x, next.y - last.y);
      lastPointerRef.current = next;
    },
    [panBy],
  );

  const onPointerUp = useCallback(() => {
    panningRef.current = false;
  }, []);

  const onPointerCancel = useCallback((_e: ReactPointerEvent<HTMLElement>) => {
    panningRef.current = false;
  }, []);

  return {
    viewport,
    isSpaceDown,
    isRestored: restored !== null,
    centerOn,
    panBy,
    panHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
