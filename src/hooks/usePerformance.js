import { useEffect, useCallback } from 'react';

// Performance monitoring hook
export const usePerformance = (componentName) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16) { // More than one frame (16ms)
          console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  });
};

// Web Vitals monitoring
export const useWebVitals = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const checkMemory = useCallback(() => {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      const usedMB = Math.round(usedJSHeapSize / 1048576);
      const totalMB = Math.round(totalJSHeapSize / 1048576);
      const limitMB = Math.round(jsHeapSizeLimit / 1048576);
      
      console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
      
      // Warn if memory usage is high
      if (usedJSHeapSize / jsHeapSizeLimit > 0.8) {
        console.warn('⚠️ High memory usage detected!');
      }
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [checkMemory]);

  return checkMemory;
};

// Bundle size monitoring
export const useBundleMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor script tags for bundle sizes
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (script.src.includes('assets')) {
          fetch(script.src, { method: 'HEAD' })
            .then(response => {
              const size = response.headers.get('content-length');
              if (size) {
                const sizeKB = Math.round(size / 1024);
                if (sizeKB > 500) { // Warn for chunks > 500KB
                  console.warn(`📦 Large bundle detected: ${script.src} (${sizeKB}KB)`);
                }
              }
            })
            .catch(() => {}); // Ignore errors
        }
      });
    }
  }, []);
};

// Render performance hook with detailed metrics
export const useRenderPerformance = (componentName, dependencies = []) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Log performance metrics
        console.group(`🔍 ${componentName} Performance`);
        console.log(`Render time: ${renderTime.toFixed(2)}ms`);
        console.log(`Dependencies:`, dependencies);
        
        if (renderTime > 16) {
          console.warn('⚠️ Slow render detected!');
        } else if (renderTime < 1) {
          console.log('✅ Fast render');
        }
        
        console.groupEnd();
      };
    }
  }, dependencies);
};