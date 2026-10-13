export interface Point {
  x: number;
  y: number;
}

export type ShapeKind = 'rectangle' | 'ellipse' | 'image';

export type Tool = 'select' | 'rectangle' | 'ellipse';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface Shape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  src?: string;
}
