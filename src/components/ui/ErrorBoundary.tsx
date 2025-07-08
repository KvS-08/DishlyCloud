import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You can also log the error to an error reporting service here
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="text-red-500 p-4 border border-red-400 rounded-md">
          <h2 className="font-bold text-lg">¡Algo salió mal!</h2>
          <p>No pudimos cargar esta sección. Por favor, inténtalo de nuevo más tarde.</p>
          <p className="text-sm text-red-400">Revisa la consola para más detalles.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;