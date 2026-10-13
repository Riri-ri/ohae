import type { Shape, ShapeKind } from '../types/shape';
import type { Viewport } from './geometry';
import { clampZoom } from './geometry';

export const LEGACY_DOCUMENT_KEY = 'minifigma:shapes:v1';
export const LEGACY_VIEWPORT_KEY = 'minifigma:viewport:v1';
export const PROJECTS_KEY = 'minifigma:projects:v1';

const SAVE_DELAY = 200;

const KINDS: readonly string[] = ['rectangle', 'ellipse', 'image'];

export interface StoredDocument {
  shapes: Shape[];
  selectedId: string | null;
}

/** Ключ документа для работы (проекта). */
export function projectDocumentKey(id: string): string {
  return `minifigma:project:${id}:document:v1`;
}

/** Ключ видоискателя для работы (проекта). */
export function projectViewportKey(id: string): string {
  return `minifigma:project:${id}:viewport:v1`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isShape(value: unknown): value is Shape {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.kind === 'string' &&
    KINDS.includes(value.kind as ShapeKind) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    typeof value.fill === 'string' &&
    (value.src === undefined || typeof value.src === 'string')
  );
}

export function readItem(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // приватный режим или переполнение: работаем без сохранения
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // хранилище недоступно — удалять нечего
  }
}

export function parseDocument(parsed: unknown, fallback: Shape[]): StoredDocument {
  if (!isRecord(parsed) || !Array.isArray(parsed.shapes)) {
    return { shapes: fallback, selectedId: null };
  }
  const shapes = parsed.shapes.filter(isShape);
  const selectedId =
    typeof parsed.selectedId === 'string' && shapes.some((shape) => shape.id === parsed.selectedId)
      ? parsed.selectedId
      : null;
  return { shapes, selectedId };
}

export function loadDocument(key: string, fallback: Shape[]): StoredDocument {
  return parseDocument(readItem(key), fallback);
}

export function saveDocument(key: string, document: StoredDocument): void {
  writeItem(key, document);
}

export function loadViewport(key: string): Viewport | null {
  const parsed = readItem(key);
  if (!isRecord(parsed)) return null;
  if (!isFiniteNumber(parsed.x) || !isFiniteNumber(parsed.y) || !isFiniteNumber(parsed.zoom)) {
    return null;
  }
  if (parsed.zoom <= 0) return null;
  return { x: parsed.x, y: parsed.y, zoom: clampZoom(parsed.zoom) };
}

export function saveViewport(key: string, viewport: Viewport): void {
  writeItem(key, viewport);
}

type PendingSave = { timer: number; run: () => void };

const pending = new Map<string, PendingSave>();

function flushSaves(): void {
  for (const [key, entry] of [...pending]) {
    window.clearTimeout(entry.timer);
    pending.delete(key);
    entry.run();
  }
}

/** Отложенное сохранение: во время перетаскивания не пишем в localStorage на каждый кадр. */
export function scheduleSave(key: string, run: () => void, delay = SAVE_DELAY): void {
  const existing = pending.get(key);
  if (existing) window.clearTimeout(existing.timer);
  const timer = window.setTimeout(() => {
    pending.delete(key);
    run();
  }, delay);
  pending.set(key, { timer, run });
}

/** Отменяет отложенное сохранение по ключу (например, при удалении работы). */
export function cancelScheduledSave(key: string): void {
  const existing = pending.get(key);
  if (!existing) return;
  window.clearTimeout(existing.timer);
  pending.delete(key);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushSaves);
}
