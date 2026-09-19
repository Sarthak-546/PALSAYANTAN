import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-3">Something went wrong</h1>
        <p className="text-gray-300 mb-6 max-w-sm">
          The assistant hit an unexpected error. Emergency services can always be reached on 112.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { window.location.href = '/'; }}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Back to Home
          </button>
          <button
            onClick={() => { window.location.href = 'tel:112'; }}
            className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
          >
            Call 112
          </button>
        </div>
        <pre className="mt-6 max-w-full overflow-x-auto text-xs text-gray-500">
          {this.state.error.message}
        </pre>
      </div>
    );
  }
}
