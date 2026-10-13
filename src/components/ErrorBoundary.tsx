import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Запасной экран вместо белого экрана при ошибке рендера. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('minifigma: ошибка рендера', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-app p-6 text-center text-zinc-100">
          <div className="text-sm font-semibold">Что-то сломалось</div>
          <p className="max-w-md text-xs text-zinc-400">
            Приложение столкнулось с ошибкой. Попробуйте перезагрузить страницу — работы сохранены в
            браузере.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white hover:bg-blue-600"
          >
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
