import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
  Suspense,
  lazy
} from 'react';

// ============================================================================
// PERFORMANCE OPTIMIZATION - Priority 8A
// Request optimization, lazy loading, caching, and bundle optimization
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    shortTTL: 30 * 1000, // 30 seconds
    longTTL: 30 * 60 * 1000, // 30 minutes
    maxEntries: 100
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000 // 10 seconds
  },
  debounce: {
    default: 300,
    search: 500,
    resize: 150
  }
};

// ============================================================================
// REQUEST CACHE
// ============================================================================

class RequestCache {
  constructor(maxEntries = CONFIG.cache.maxEntries) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
  }

  generateKey(url, options = {}) {
    return `${url}|${JSON.stringify(options)}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key, data, ttl = CONFIG.cache.defaultTTL) {
    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // Delete exact key or keys matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else if (pattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) expiredEntries++;
      else validEntries++;
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      maxEntries: this.maxEntries
    };
  }
}

// Global cache instance
const globalCache = new RequestCache();

// ============================================================================
// DEBOUNCE & THROTTLE UTILITIES
// ============================================================================

export const debounce = (func, wait = CONFIG.debounce.default) => {
  let timeout;

  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };

  debounced.cancel = () => clearTimeout(timeout);
  debounced.flush = (...args) => {
    clearTimeout(timeout);
    func.apply(this, args);
  };

  return debounced;
};

export const throttle = (func, limit) => {
  let inThrottle;
  let lastArgs;

  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
};

// ============================================================================
// DEBOUNCE HOOKS
// ============================================================================

export const useDebounce = (value, delay = CONFIG.debounce.default) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const useDebouncedCallback = (callback, delay = CONFIG.debounce.default, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
};

// ============================================================================
// RETRY WITH EXPONENTIAL BACKOFF
// ============================================================================

export const withRetry = async (
  fn,
  {
    maxAttempts = CONFIG.retry.maxAttempts,
    baseDelay = CONFIG.retry.baseDelay,
    maxDelay = CONFIG.retry.maxDelay,
    onRetry = null,
    shouldRetry = (error) => true
  } = {}
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      );

      if (onRetry) {
        onRetry({ attempt, error, delay, maxAttempts });
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// ============================================================================
// ABORT CONTROLLER FOR REQUEST CANCELLATION
// ============================================================================

export const createAbortController = () => {
  const controller = new AbortController();

  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    isAborted: () => controller.signal.aborted
  };
};

// Track in-flight requests for cancellation on navigation
const inFlightRequests = new Map();

export const cancelAllRequests = (reason = 'Navigation') => {
  for (const [key, controller] of inFlightRequests) {
    controller.abort();
    inFlightRequests.delete(key);
  }
};

// ============================================================================
// ENHANCED FETCH WITH CACHING, RETRY, AND CANCELLATION
// ============================================================================

export const enhancedFetch = async (url, options = {}) => {
  const {
    cache: useCache = true,
    cacheTTL = CONFIG.cache.defaultTTL,
    retry = true,
    retryOptions = {},
    cancelKey = null,
    transform = (data) => data,
    ...fetchOptions
  } = options;

  const cacheKey = globalCache.generateKey(url, fetchOptions);

  // Check cache first
  if (useCache && fetchOptions.method !== 'POST') {
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  // Create abort controller
  const controller = new AbortController();
  const requestKey = cancelKey || cacheKey;

  // Cancel existing request with same key
  if (inFlightRequests.has(requestKey)) {
    inFlightRequests.get(requestKey).abort();
  }
  inFlightRequests.set(requestKey, controller);

  const fetchFn = async () => {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return transform(data);
    } finally {
      inFlightRequests.delete(requestKey);
    }
  };

  try {
    const data = retry
      ? await withRetry(fetchFn, retryOptions)
      : await fetchFn();

    // Cache successful responses
    if (useCache && fetchOptions.method !== 'POST') {
      globalCache.set(cacheKey, data, cacheTTL);
    }

    return { data, fromCache: false };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { data: null, aborted: true };
    }
    throw error;
  }
};

// ============================================================================
// REACT QUERY-LIKE HOOK
// ============================================================================

export const useQuery = (key, fetcher, options = {}) => {
  const {
    enabled = true,
    refetchInterval = null,
    refetchOnWindowFocus = true,
    staleTime = CONFIG.cache.defaultTTL,
    cacheTime = CONFIG.cache.longTTL,
    onSuccess = null,
    onError = null,
    retry = true,
    retryCount = 3
  } = options;

  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
    isFetching: false,
    isStale: false,
    dataUpdatedAt: null
  });

  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: !isRefetch && !prev.data,
      isFetching: true,
      error: null
    }));

    try {
      const data = retry
        ? await withRetry(() => fetcher({ signal: abortControllerRef.current.signal }), { maxAttempts: retryCount })
        : await fetcher({ signal: abortControllerRef.current.signal });

      if (mountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isFetching: false,
          isStale: false,
          dataUpdatedAt: Date.now()
        });

        if (onSuccess) onSuccess(data);
      }
    } catch (error) {
      if (error.name === 'AbortError') return;

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error,
          isLoading: false,
          isFetching: false
        }));

        if (onError) onError(error);
      }
    }
  }, [enabled, fetcher, retry, retryCount, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [key, enabled]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (state.dataUpdatedAt && Date.now() - state.dataUpdatedAt > staleTime) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, staleTime, state.dataUpdatedAt, fetchData]);

  // Mark as stale
  useEffect(() => {
    if (!state.dataUpdatedAt) return;

    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isStale: true }));
      }
    }, staleTime);

    return () => clearTimeout(timeout);
  }, [state.dataUpdatedAt, staleTime]);

  return {
    ...state,
    refetch: () => fetchData(true),
    invalidate: () => {
      globalCache.invalidate(key);
      fetchData();
    }
  };
};

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

// Lazy load with retry
export const lazyWithRetry = (importFn, retries = 3) => {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  });
};

// Preload component
export const preloadComponent = (importFn) => {
  return importFn();
};

// Lazy Image Component
export const LazyImage = ({
  src,
  alt,
  placeholder = null,
  errorFallback = null,
  onLoad = null,
  onError = null,
  threshold = 0.1,
  rootMargin = '100px',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  if (hasError && errorFallback) {
    return errorFallback;
  }

  return (
    <div ref={imgRef} style={{ position: 'relative', ...props.containerStyle }}>
      {!isLoaded && placeholder}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            ...props.style
          }}
          {...props}
        />
      )}
    </div>
  );
};

// ============================================================================
// LOADING FALLBACKS
// ============================================================================

export const LoadingSpinner = ({ size = 40, color = '#60a5fa' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  }}>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{
      width: size,
      height: size,
      border: `3px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

export const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 4 }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export const PageSkeleton = () => (
  <div style={{ padding: 20 }}>
    <SkeletonLoader height={40} width="60%" style={{ marginBottom: 20 }} />
    <SkeletonLoader height={20} width="100%" style={{ marginBottom: 12 }} />
    <SkeletonLoader height={20} width="90%" style={{ marginBottom: 12 }} />
    <SkeletonLoader height={20} width="95%" style={{ marginBottom: 24 }} />
    <SkeletonLoader height={200} width="100%" borderRadius={12} />
  </div>
);

// ============================================================================
// SUSPENSE BOUNDARY WITH ERROR HANDLING
// ============================================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: 32,
          textAlign: 'center',
          color: '#f87171'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px' }}>Something went wrong</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 16px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              padding: '10px 20px',
              background: '#60a5fa',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const SuspenseBoundary = ({ children, fallback = <LoadingSpinner />, errorFallback = null, onError = null }) => (
  <ErrorBoundary fallback={errorFallback} onError={onError}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// ============================================================================
// ROUTE-BASED CODE SPLITTING HELPER
// ============================================================================

export const createLazyRoute = (importFn, options = {}) => {
  const {
    preload = false,
    fallback = <PageSkeleton />,
    minDelay = 0
  } = options;

  const LazyComponent = lazyWithRetry(async () => {
    const start = Date.now();
    const module = await importFn();

    // Artificial minimum delay to prevent flash of loading
    const elapsed = Date.now() - start;
    if (minDelay > elapsed) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
    }

    return module;
  });

  // Preload on hover/focus
  if (preload) {
    preloadComponent(importFn);
  }

  const Route = (props) => (
    <SuspenseBoundary fallback={fallback}>
      <LazyComponent {...props} />
    </SuspenseBoundary>
  );

  Route.preload = () => preloadComponent(importFn);

  return Route;
};

// ============================================================================
// VIRTUALIZED LIST FOR LARGE DATASETS
// ============================================================================

export const VirtualizedList = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback(
    throttle((e) => {
      setScrollTop(e.target.scrollTop);
    }, 16),
    []
  );

  const { visibleItems, startIndex, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
    const endIndex = Math.min(items.length, startIndex + visibleCount);

    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: offsetY,
          left: 0,
          right: 0
        }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PERFORMANCE CONTEXT & MONITORING
// ============================================================================

const PerformanceContext = createContext(null);

export const usePerformance = () => {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error('usePerformance must be used within PerformanceProvider');
  return ctx;
};

export const PerformanceProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    avgResponseTime: 0,
    responseTimes: []
  });

  const trackApiCall = useCallback((duration, fromCache, error = false) => {
    setMetrics(prev => {
      const responseTimes = [...prev.responseTimes.slice(-99), duration];
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      return {
        apiCalls: prev.apiCalls + 1,
        cacheHits: prev.cacheHits + (fromCache ? 1 : 0),
        cacheMisses: prev.cacheMisses + (fromCache ? 0 : 1),
        errors: prev.errors + (error ? 1 : 0),
        avgResponseTime,
        responseTimes
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgResponseTime: 0,
      responseTimes: []
    });
  }, []);

  const getCacheStats = useCallback(() => {
    return globalCache.getStats();
  }, []);

  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  const value = {
    metrics,
    trackApiCall,
    resetMetrics,
    getCacheStats,
    clearCache,
    cache: globalCache
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false
  } = options;

  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        if (entry.isIntersecting && triggerOnce) {
          observer.current.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (node) {
      observer.current.observe(node);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, rootMargin, triggerOnce]);

  return [setNode, entry?.isIntersecting ?? false, entry];
};

// ============================================================================
// PREFETCH HOOK
// ============================================================================

export const usePrefetch = (urls, options = {}) => {
  const { priority = 'low', as = 'fetch' } = options;

  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = as;
      link.importance = priority;
      document.head.appendChild(link);
    });

    return () => {
      urls.forEach(url => {
        const link = document.querySelector(`link[href="${url}"][rel="prefetch"]`);
        if (link) link.remove();
      });
    };
  }, [urls, priority, as]);
};

// ============================================================================
// MEMORY-EFFICIENT MEMOIZATION
// ============================================================================

export const memoize = (fn, options = {}) => {
  const {
    maxSize = 100,
    ttl = null,
    keyFn = (...args) => JSON.stringify(args)
  } = options;

  const cache = new Map();

  const memoized = (...args) => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached) {
      if (!ttl || Date.now() < cached.expiresAt) {
        // Move to end (LRU)
        cache.delete(key);
        cache.set(key, cached);
        return cached.value;
      }
      cache.delete(key);
    }

    const value = fn(...args);

    // Evict oldest if at capacity
    while (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, {
      value,
      expiresAt: ttl ? Date.now() + ttl : null
    });

    return value;
  };

  memoized.clear = () => cache.clear();
  memoized.delete = (key) => cache.delete(key);
  memoized.has = (key) => cache.has(key);

  return memoized;
};

// ============================================================================
// PERFORMANCE DASHBOARD COMPONENT
// ============================================================================

export const PerformanceDashboard = () => {
  const { metrics, getCacheStats, clearCache, resetMetrics } = usePerformance();
  const cacheStats = getCacheStats();

  const cacheHitRate = metrics.apiCalls > 0
    ? ((metrics.cacheHits / metrics.apiCalls) * 100).toFixed(1)
    : 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      borderRadius: 16,
      padding: 24
    }}>
      <h3 style={{
        color: '#f8fafc',
        margin: '0 0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span>⚡</span>
        Performance Monitor
      </h3>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 24
      }}>
        <div style={{
          padding: 16,
          background: 'rgba(96, 165, 250, 0.1)',
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>
            {metrics.apiCalls}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>API Calls</div>
        </div>

        <div style={{
          padding: 16,
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
            {cacheHitRate}%
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Cache Hit Rate</div>
        </div>

        <div style={{
          padding: 16,
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
            {metrics.avgResponseTime.toFixed(0)}ms
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Avg Response</div>
        </div>

        <div style={{
          padding: 16,
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
            {metrics.errors}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Errors</div>
        </div>
      </div>

      {/* Cache Stats */}
      <div style={{
        padding: 16,
        background: 'rgba(51, 65, 85, 0.3)',
        borderRadius: 10,
        marginBottom: 16
      }}>
        <h4 style={{ color: '#e2e8f0', margin: '0 0 12px', fontSize: 14 }}>
          Cache Status
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Entries: {cacheStats.valid}/{cacheStats.maxEntries}</span>
          <span style={{ color: '#94a3b8' }}>Hits: {metrics.cacheHits}</span>
          <span style={{ color: '#94a3b8' }}>Misses: {metrics.cacheMisses}</span>
        </div>
        {/* Cache usage bar */}
        <div style={{
          marginTop: 8,
          height: 8,
          background: 'rgba(51, 65, 85, 0.5)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(cacheStats.valid / cacheStats.maxEntries) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
            borderRadius: 4
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={clearCache}
          style={{
            flex: 1,
            padding: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: 'none',
            borderRadius: 8,
            color: '#f87171',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Clear Cache
        </button>
        <button
          onClick={resetMetrics}
          style={{
            flex: 1,
            padding: 12,
            background: 'rgba(96, 165, 250, 0.15)',
            border: 'none',
            borderRadius: 8,
            color: '#60a5fa',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Reset Metrics
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  globalCache,
  RequestCache,
  ErrorBoundary,
  CONFIG as PERFORMANCE_CONFIG
};

export default PerformanceProvider;
