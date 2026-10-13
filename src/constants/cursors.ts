export interface CursorOption {
  id: string;
  label: string;
  /** Значение CSS-свойства cursor, включая фолбэк. */
  value: string;
}

function svgCursor(svg: string, hotX: number, hotY: number, fallback = 'auto'): string {
  const encoded = encodeURIComponent(svg.replace(/\s+/g, ' ').trim());
  return `url("data:image/svg+xml,${encoded}") ${hotX} ${hotY}, ${fallback}`;
}

const PAW = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <g fill="#ff8fab" stroke="#3a2a33" stroke-width="1.5">
      <ellipse cx="16" cy="21" rx="7" ry="6"/>
      <circle cx="8" cy="13" r="3.2"/>
      <circle cx="14" cy="8.5" r="3.4"/>
      <circle cx="20.5" cy="8.5" r="3.4"/>
      <circle cx="25.5" cy="14" r="3"/>
    </g>
  </svg>`,
  16,
  6,
);

const CAT = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M6 11l1-8 7 4.5a12 12 0 0 1 8 0L29 3l1 8a10.5 10.5 0 0 1-2.5 15H8.5A10.5 10.5 0 0 1 6 11z" fill="#ffb703" stroke="#3a2a33" stroke-width="1.5"/>
    <circle cx="12.5" cy="14.5" r="1.7" fill="#3a2a33"/>
    <circle cx="19.5" cy="14.5" r="1.7" fill="#3a2a33"/>
    <path d="M14.5 19h4" stroke="#3a2a33" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  16,
  8,
);

const PENCIL = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M4 28l2-7L22 5l5 5L11 26z" fill="#ffd166" stroke="#3a2a33" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M22 5l3-3 5 5-3 3z" fill="#ef476f"/>
    <path d="M4 28l2-7 5 5z" fill="#f4a261"/>
  </svg>`,
  4,
  28,
);

const STAR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 2l3.2 9.3L29 14l-9.8 2.7L16 26l-3.2-9.3L3 14l9.8-2.7z" fill="#ffd166" stroke="#3a2a33" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  16,
  14,
);

const HEART = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 27S4 19 4 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 12 3.5C28 19 16 27 16 27z" fill="#ef476f" stroke="#3a2a33" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  16,
  6,
);

const ROCKET = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 2c6 4 8 12 6 20l-6 3-6-3C8 14 10 6 16 2z" fill="#dce4f5" stroke="#3a2a33" stroke-width="1.4"/>
    <circle cx="16" cy="12" r="3.2" fill="#4dabf7" stroke="#3a2a33" stroke-width="1.4"/>
    <path d="M10 22l-4 6 6-2zM22 22l4 6-6-2z" fill="#ef476f"/>
    <path d="M14 27h4l-2 4z" fill="#ffd166"/>
  </svg>`,
  16,
  2,
);

const GHOST = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M6 29V14a10 10 0 0 1 20 0v15l-3.3-2-3.4 2-3.3-2-3.4 2-3.3-2z" fill="#f1f3f5" stroke="#3a2a33" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="12.5" cy="14" r="1.8" fill="#3a2a33"/>
    <circle cx="19.5" cy="14" r="1.8" fill="#3a2a33"/>
  </svg>`,
  16,
  5,
);

const RAINBOW = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff5d8f"/>
      <stop offset="0.5" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#4dabf7"/>
    </linearGradient></defs>
    <path d="M7 3l16 9.5-6.8 1.6L14 29 7 3z" fill="url(#g)" stroke="#ffffff" stroke-width="1.3" stroke-linejoin="round"/>
  </svg>`,
  7,
  3,
);

export const CURSORS: CursorOption[] = [
  { id: 'default', label: 'Стандарт', value: 'default' },
  { id: 'pointer', label: 'Указатель', value: 'pointer' },
  { id: 'crosshair', label: 'Прицел', value: 'crosshair' },
  { id: 'paw', label: 'Кошачья лапа', value: PAW },
  { id: 'cat', label: 'Кот', value: CAT },
  { id: 'pencil', label: 'Карандаш', value: PENCIL },
  { id: 'star', label: 'Звезда', value: STAR },
  { id: 'heart', label: 'Сердце', value: HEART },
  { id: 'rocket', label: 'Ракета', value: ROCKET },
  { id: 'ghost', label: 'Призрак', value: GHOST },
  { id: 'rainbow', label: 'Радуга', value: RAINBOW },
];

export const DEFAULT_CURSOR_ID = 'default';

export function cursorValue(id: string): string {
  return CURSORS.find((option) => option.id === id)?.value ?? 'default';
}
