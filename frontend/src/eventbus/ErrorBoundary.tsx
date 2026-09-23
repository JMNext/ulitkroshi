import { Component, ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  public state = { hasError: false };

  public static getDerivedStateFromError() { return { hasError: true }; }
  public componentDidCatch(err: Error, info: ErrorInfo) {}

  render() {
    return this.state.hasError ? (
      <div className="pointer-events-auto fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 p-4 font-sans text-white">
        <div className="max-w-md rounded-2xl border border-solid border-orange-500/30 bg-zinc-900 p-6 text-center shadow-2xl">
          <h2 className="text-xl font-black tracking-wide text-orange-500 uppercase">Упс! Что-то пошло не так</h2>
          <p className="mt-2 text-sm font-medium text-zinc-400">Интерфейс временно недоступен из-за технической ошибки, но игра продолжает работать.</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-6 h-11 cursor-pointer rounded-xl border-0 bg-orange-500 px-6 text-sm font-black text-white uppercase shadow-md transition-all hover:bg-orange-600 active:scale-95">Перезапустить UI</button>
        </div>
      </div>
    ) : this.props.children;
  }
}
