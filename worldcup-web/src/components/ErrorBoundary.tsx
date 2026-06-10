import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[var(--bg)] px-4 py-16 text-center">
          <div className="sb-card max-w-sm mx-auto p-6">
            <p className="text-sm font-semibold text-[var(--text)] mb-2">页面加载出错</p>
            <p className="text-xs text-[var(--text-muted)] mb-4 break-all">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="px-4 py-2 rounded-md text-sm font-semibold text-[#0a0a0a]"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
