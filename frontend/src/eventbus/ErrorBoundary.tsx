import React, { Component, ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  public state = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pointer-events-auto fixed inset-0 z- flex flex-col items-center justify-center bg-black/80 font-sans text-white p-4">
          <div className="max-w-md text-center bg-zinc-900 border border-solid border-orange-500/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-orange-500 uppercase tracking-wide">Упс! Что-то пошло не так</h2>
            <p className="mt-2 text-sm text-zinc-400 font-medium">Интерфейс временно недоступен из-за технической ошибки, но игра продолжает работать.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-6 h-11 px-6 bg-orange-500 hover:bg-orange-600 active:scale-95 text-sm font-black text-white uppercase rounded-xl border-0 cursor-pointer shadow-md transition-all"
            >
              Перезапустить UI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
