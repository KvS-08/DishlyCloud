import React, { Suspense, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../ui/LoadingSpinner'; // Asegúrate de que la ruta sea correcta

interface WithLazyLoadingProps {
  // Puedes añadir props adicionales si el HOC las necesita
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <p>Algo salió mal:</p>
      <pre className="whitespace-pre-wrap text-sm">{error.message}</pre>
    </div>
  );
}

const withLazyLoading = <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) => {
  const LazyComponent = React.lazy(importFn);

  const ComponentWithLazyLoading: React.FC<P & WithLazyLoadingProps> = (props) => {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={
          <div className="flex justify-center items-center w-full h-full">
            <LoadingSpinner />
          </div>
        }>
          <LazyComponent {...props as P} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  return ComponentWithLazyLoading;
};

export default withLazyLoading;