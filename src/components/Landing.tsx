import { useState } from 'react';
import type { ReactNode } from 'react';
import { CatLogo } from './CatLogo';
import { buildImageUrl, randomSeed } from '../utils/aiImage';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const FEATURES: { title: string; text: string }[] = [
  { title: 'Фигуры', text: 'Прямоугольники и эллипсы — рисуй мышью или пальцем.' },
  { title: 'Слои и свойства', text: 'Выбор, цвет и панель свойств фигуры.' },
  { title: 'Undo / Redo', text: 'Отмена и повтор: Ctrl+Z и Ctrl+Shift+Z.' },
  { title: 'Шаблоны', text: 'Готовые макеты, с которых удобно начать.' },
  { title: 'Автосохранение', text: 'Работы хранятся в браузере, без аккаунта.' },
  { title: 'Котики и курсор', text: 'Немного настроения и свой курсор.' },
];

const STEPS: { title: string; text: string }[] = [
  { title: 'Открой редактор', text: 'Нажми «Открыть редактор» — попадёшь на холст.' },
  { title: 'Рисуй', text: 'Инструменты слева: V — выбор, R — прямоугольник, O — эллипс.' },
  { title: 'Двигай и меняй', text: 'Перетаскивай, тяни за углы, меняй цвет в панели.' },
  { title: 'Возвращайся', text: 'Работа сохраняется сама — закрой вкладку и вернись позже.' },
];

function EditorMock() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-canvas">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--color-accent) 14%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="absolute inset-y-0 left-0 flex w-8 flex-col items-center gap-1.5 bg-surface py-2">
        <span className="h-5 w-5 rounded bg-blue-500" />
        <span className="h-5 w-5 rounded bg-zinc-700" />
        <span className="h-5 w-5 rounded bg-zinc-700" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-[70%] -translate-y-[60%] rounded bg-[#7c6cff]" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-[10%] -translate-y-[10%] rounded-full bg-accent opacity-90" />
    </div>
  );
}

function TemplatesMock() {
  const swatches = ['#4da3ff', '#7c6cff', '#ffd166', '#ff5d8f', '#94e2a5', '#e7ebf5'];
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1.5 bg-preview p-2.5">
      {swatches.map((color, index) => (
        <div key={color} className="flex flex-col gap-1 rounded bg-surface p-1.5">
          <div className="flex-1 rounded-sm" style={{ backgroundColor: color }} />
          <div className="h-1.5 w-2/3 rounded-full bg-zinc-700" />
          <div className={`h-1.5 rounded-full bg-zinc-800 ${index % 2 ? 'w-1/2' : 'w-3/4'}`} />
        </div>
      ))}
    </div>
  );
}

function ScreenshotCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-zinc-800 bg-surface">
      <div className="aspect-[4/3] border-b border-zinc-800">{children}</div>
      <figcaption className="px-3 py-2 text-xs font-medium text-zinc-300">{title}</figcaption>
    </figure>
  );
}

function MemeCat() {
  const [src] = useState(() =>
    buildImageUrl(
      'funny happy cat meme for designers, cute, high detail, studio lighting',
      512,
      randomSeed(),
    ),
  );
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-surface">
      {failed ? (
        <CatLogo className="h-20 w-20" />
      ) : (
        <img
          src={src}
          alt="Мемный котик"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [hint, setHint] = useState(false);

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    setHint(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-app text-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-5 py-10 md:py-16">
        <header className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-2">
            <CatLogo className="h-10 w-10 shrink-0" />
            <span className="text-lg font-semibold">minifigma</span>
          </div>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
            Мини-фигма в кармане
          </h1>
          <p className="max-w-xl text-sm text-zinc-400">
            Дизайн-редактор в браузере на телефоне и компьютере — без аккаунта и оплаты. Поймай идею
            и собери черновик, когда полноценная Figma недоступна.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onEnter}
              className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Открыть редактор
            </button>
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              {installed ? 'Приложение установлено' : 'Скачать приложение'}
            </button>
          </div>
          {installed ? (
            <p className="text-xs text-emerald-400">Иконка minifigma уже на устройстве.</p>
          ) : (
            hint && (
              <p className="max-w-md text-xs text-zinc-500">
                {canInstall
                  ? 'Подтверди установку в диалоге браузера.'
                  : 'Установка доступна в Chrome и Edge: меню браузера → «Установить приложение». Открой сайт по HTTPS или на localhost.'}
              </p>
            )
          )}
        </header>

        <section aria-label="Возможности">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Что внутри
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-zinc-800 bg-surface p-4">
                <div className="text-sm font-medium text-zinc-100">{feature.title}</div>
                <p className="mt-1 text-xs text-zinc-500">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Скриншоты">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Как это выглядит
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScreenshotCard title="Редактор">
              <EditorMock />
            </ScreenshotCard>
            <ScreenshotCard title="Шаблоны">
              <TemplatesMock />
            </ScreenshotCard>
          </div>
        </section>

        <section aria-label="Как пользоваться">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Как пользоваться
          </h2>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-zinc-800 bg-surface p-4">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div className="text-sm font-medium text-zinc-100">{step.title}</div>
                <p className="mt-1 text-xs text-zinc-500">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="flex flex-col items-center gap-4 border-t border-zinc-800 pt-8 text-center">
          <MemeCat />
          <div className="text-sm font-medium text-zinc-300">Приятного пользования!</div>
          <button
            type="button"
            onClick={onEnter}
            className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Начать работу
          </button>
        </footer>
      </div>
    </div>
  );
}
