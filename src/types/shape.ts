export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ShapeKind = 'rectangle' | 'ellipse' | 'image';

export type Tool = 'select' | 'rectangle' | 'ellipse';

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
