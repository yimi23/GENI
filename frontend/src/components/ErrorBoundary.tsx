import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorCount: 0 });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <AlertOctagon className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-center text-gray-600 mb-4">
              GENI encountered an unexpected error. Please try refreshing the page.
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-sm font-mono text-red-800 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Restart GENI
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Error ID: {Date.now()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
