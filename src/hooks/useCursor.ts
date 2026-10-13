import { useCallback, useEffect, useState } from 'react';
import { CURSORS, DEFAULT_CURSOR_ID, cursorValue } from '../constants/cursors';
import { readItem, writeItem } from '../utils/storage';

const CURSOR_KEY = 'minifigma:cursor:v1';

function loadCursorId(): string {
  const raw = readItem(CURSOR_KEY);
  return typeof raw === 'string' && CURSORS.some((option) => option.id === raw) ? raw : DEFAULT_CURSOR_ID;
}

export interface UseCursorResult {
  cursorId: string;
  cursor: string;
  setCursorId: (id: string) => void;
}

export function useCursor(): UseCursorResult {
  const [cursorId, setCursorIdState] = useState(loadCursorId);
  const cursor = cursorValue(cursorId);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-cursor', cursor);
  }, [cursor]);

  const setCursorId = useCallback((id: string) => {
    setCursorIdState(id);
    writeItem(CURSOR_KEY, id);
  }, []);

  return { cursorId, cursor, setCursorId };
}
