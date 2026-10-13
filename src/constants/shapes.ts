import type { Shape, ShapeKind } from '../types/shape';

export const KIND_LABEL: Record<ShapeKind, string> = {
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  image: 'Image',
};

/** Стартовая сцена для самой первой работы. */
export const STARTER_SHAPES: Shape[] = [
  { id: 'starter-rect', kind: 'rectangle', x: -120, y: -64, width: 240, height: 128, fill: '#7c6cff' },
  { id: 'starter-ellipse', kind: 'ellipse', x: -60, y: 96, width: 120, height: 120, fill: '#4da3ff' },
];
