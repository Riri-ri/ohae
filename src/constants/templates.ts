import type { Shape, ShapeKind } from '../types/shape';
import { uid } from '../utils/id';

export interface TemplateShape {
  kind: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

export interface Template {
  id: string;
  name: string;
  caption: string;
  layout: TemplateShape[];
}

const INK = '#0f1220';
const PANEL = '#1c2030';
const BAR = '#2a2f42';
const MUTED = '#4a5372';
const LIGHT = '#e7ebf5';
const ACCENT = '#7c6cff';
const BLUE = '#4da3ff';
const PINK = '#ff5d8f';
const YELLOW = '#ffd166';

function rect(x: number, y: number, w: number, h: number, fill: string): TemplateShape {
  return { kind: 'rectangle', x, y, w, h, fill };
}

function dot(x: number, y: number, d: number, fill: string): TemplateShape {
  return { kind: 'ellipse', x, y, w: d, h: d, fill };
}

export const TEMPLATES: Template[] = [
  {
    id: 'landing',
    name: 'Лендинг',
    caption: 'Первый экран с заголовком, кнопкой и картинкой',
    layout: [
      rect(0, 0, 960, 640, INK),
      rect(0, 0, 960, 72, '#151a2b'),
      dot(28, 22, 28, ACCENT),
      rect(700, 30, 70, 12, BAR),
      rect(790, 30, 70, 12, BAR),
      rect(880, 30, 56, 12, BAR),
      rect(56, 150, 420, 44, LIGHT),
      rect(56, 210, 320, 20, MUTED),
      rect(56, 242, 260, 20, MUTED),
      rect(56, 296, 180, 52, ACCENT),
      dot(820, 60, 130, PINK),
      rect(560, 140, 360, 360, BLUE),
    ],
  },
  {
    id: 'mobile',
    name: 'Мобильное приложение',
    caption: 'Экран со списком карточек и кнопкой действия',
    layout: [
      rect(0, 0, 320, 640, INK),
      rect(40, 40, 240, 560, '#151a2b'),
      rect(40, 40, 240, 28, PANEL),
      dot(60, 84, 44, ACCENT),
      rect(116, 92, 120, 14, MUTED),
      rect(116, 114, 80, 10, BAR),
      rect(60, 150, 200, 96, PANEL),
      rect(60, 262, 200, 96, PANEL),
      dot(240, 540, 48, PINK),
    ],
  },
  {
    id: 'poster',
    name: 'Постер',
    caption: 'Крупная графика и подпись внизу',
    layout: [
      rect(0, 0, 600, 800, INK),
      dot(120, 120, 360, ACCENT),
      dot(180, 180, 240, YELLOW),
      dot(240, 240, 120, PINK),
      rect(120, 600, 360, 36, LIGHT),
      rect(180, 656, 240, 20, MUTED),
    ],
  },
  {
    id: 'dashboard',
    name: 'Дашборд',
    caption: 'Боковое меню, метрики и график',
    layout: [
      rect(0, 0, 1000, 640, INK),
      rect(0, 0, 200, 640, '#151a2b'),
      dot(24, 24, 32, ACCENT),
      rect(24, 90, 150, 14, BAR),
      rect(24, 130, 150, 14, BAR),
      rect(24, 170, 150, 14, BAR),
      rect(24, 210, 150, 14, BAR),
      rect(200, 0, 800, 64, '#151a2b'),
      rect(224, 96, 224, 120, PANEL),
      rect(472, 96, 224, 120, PANEL),
      rect(720, 96, 224, 120, PANEL),
      rect(248, 200, 80, 12, BLUE),
      rect(496, 200, 80, 12, ACCENT),
      rect(744, 200, 80, 12, YELLOW),
      rect(224, 248, 720, 340, PANEL),
      rect(260, 460, 60, 100, BLUE),
      rect(370, 400, 60, 160, ACCENT),
      rect(480, 440, 60, 120, PINK),
      rect(590, 360, 60, 200, BLUE),
      rect(700, 420, 60, 140, YELLOW),
      rect(810, 390, 60, 170, ACCENT),
    ],
  },
  {
    id: 'cat-logo',
    name: 'Логотип-кот',
    caption: 'Забавный нестандартный логотип для бренда',
    layout: [
      dot(50, 50, 300, '#151a2b'),
      dot(120, 110, 60, '#ffb703'),
      dot(220, 110, 60, '#ffb703'),
      dot(110, 150, 180, '#ffb703'),
      dot(159, 197, 22, '#3a2a33'),
      dot(219, 197, 22, '#3a2a33'),
      dot(191, 228, 18, PINK),
      rect(180, 70, 40, 30, YELLOW),
      rect(120, 240, 50, 6, '#3a2a33'),
      rect(230, 240, 50, 6, '#3a2a33'),
    ],
  },
];

export function buildTemplate(template: Template): Shape[] {
  return template.layout.map((item) => ({
    id: uid(),
    kind: item.kind,
    x: item.x,
    y: item.y,
    width: item.w,
    height: item.h,
    fill: item.fill,
  }));
}
