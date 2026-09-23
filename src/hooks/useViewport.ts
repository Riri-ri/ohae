import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Point } from '../types/shape';
import { clampZoom, screenToCanvas } from '../utils/geometry';
import type { Viewport } from '../utils/geometry';

const WHEEL_ZOOM_SENSITIVITY = 0.002;

export interface Camera {
  viewport: Viewport;
  isSpaceDown: boolean;
  centerOn: (center: Point) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (point: Point, factor: number) => void;
  panHandlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  };
}

export function useViewport(): Camera {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  const spaceRef = useRef(false);
  const panningRef = useRef(false);
  const lastPointerRef = useRef<Point>({ x: 0, y: 0 });

  const centerOn = useCallback((center: Point) => {
    setViewport((v) => ({ ...v, x: center.x, y: center.y }));
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const zoomAt = useCallback((point: Point, factor: number) => {
    setViewport((v) => {
      const zoom = clampZoom(v.zoom * factor);
      const canvas = screenToCanvas(point, v);
      return {
        zoom,
        x: point.x - canvas.x * zoom,
        y: point.y - canvas.y * zoom,
      };
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
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
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * WHEEL_ZOOM_SENSITIVITY);
      zoomAt({ x: e.clientX, y: e.clientY }, factor);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!spaceRef.current) return;
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

  return {
    viewport,
    isSpaceDown,
    centerOn,
    panBy,
    zoomAt,
    panHandlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
