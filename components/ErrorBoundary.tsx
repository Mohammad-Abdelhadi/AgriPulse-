import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Refactored to use a constructor for state initialization to ensure `this.props` and `this.state` are correctly bound and available on the component instance.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <h1 className="text-3xl font-bold text-red-600">Something went wrong.</h1>
                <p className="text-text-secondary mt-4">
                    We've encountered an unexpected error. Please try reloading the application.
                </p>
                <details className="mt-4 p-4 bg-gray-100 rounded text-left text-sm text-text-secondary overflow-auto">
                    <summary className="font-semibold cursor-pointer">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error?.toString()}
                    </pre>
                </details>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;