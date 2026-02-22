import React, { Suspense, lazy, useState, useEffect } from 'react';
import { LoadingSpinner } from './NotificationSystem';

// Lazy load components for code splitting
export const LazyComponent = ({
  component: Component,
  fallback = <DefaultLoading />,
  ...props
}: {
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinner size="lg" />
  </div>
);

// Lazy loaded page components
export const LazyLandingPage = lazy(() => import('../pages/LandingPage'));
export const LazyDashboardPage = lazy(() => import('../pages/DashboardPage'));
export const LazyProfilePage = lazy(() => import('../pages/ProfilePage'));
export const LazyTripsPage = lazy(() => import('../pages/TripsPage'));
export const LazySavedPage = lazy(() => import('../pages/SavedPage'));
export const LazyAdminPage = lazy(() => import('../pages/AdminPage'));

// Image lazy loader with blur placeholder
export const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = 'bg-slate-200'
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${placeholder} ${className}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

// Intersection observer wrapper for lazy loading content
export const LazyContent = ({
  children,
  threshold = 0.1,
  rootMargin = '100px'
}: {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={isVisible ? 'animate-fade-in' : ''}>
      {isVisible ? children : <div className="min-h-[200px]" />}
    </div>
  );
};

// Virtual list for large datasets
export const VirtualList = ({
  items,
  renderItem,
  itemHeight = 60,
  containerHeight = 400
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 5
  );

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Preload resources
export const usePreloadResources = (urls: string[]) => {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
};

// Memoized components for performance
export const MemoizedCard = React.memo(({ children, ...props }: any) => (
  <div {...props}>{children}</div>
));

export const MemoizedImage = React.memo(({ src, alt, ...props }: any) => (
  <img src={src} alt={alt} {...props} />
));

// Error boundary for graceful error handling
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-slate-500">Please refresh the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Retry wrapper for failed requests
export const RetryWrapper = ({
  children,
  maxRetries = 3,
  retryDelay = 1000
}: {
  children: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setHasError(false);
    }
  };

  if (hasError && retryCount >= maxRetries) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Failed to load after {maxRetries} attempts</p>
        <button
          onClick={() => { setRetryCount(0); setHasError(false); }}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className="p-8 text-center">
        {hasError ? (
          <>
            <p className="text-slate-500 mb-4">Failed to load. Retrying...</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg"
            >
              Retry ({maxRetries - retryCount} left)
            </button>
          </>
        ) : (
          <DefaultLoading />
        )}
      </div>
    }>
      {children}
    </ErrorBoundary>
  );
};

export default {
  LazyComponent,
  LazyImage,
  LazyContent,
  VirtualList,
  usePreloadResources,
  MemoizedCard,
  MemoizedImage,
  ErrorBoundary,
  RetryWrapper
};
