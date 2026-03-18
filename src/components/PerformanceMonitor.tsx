import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentName: string;
}

interface PerformanceMonitorProps {
  componentName: string;
}

/**
 * Development-only component that logs performance metrics when unmounted.
 * Wrap expensive components to track render time and memory delta.
 */
export function PerformanceMonitor({ componentName }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const startMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } })
      .memory?.usedJSHeapSize ?? 0;

    return () => {
      const endTime = performance.now();
      const endMemory = (performance as Performance & { memory?: { usedJSHeapSize: number } })
        .memory?.usedJSHeapSize ?? 0;

      setMetrics({
        renderTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        componentName,
      });
    };
  }, [componentName]);

  if (import.meta.env.DEV && metrics) {
    console.log(`[Perf] ${componentName}:`, {
      renderTime: `${metrics.renderTime.toFixed(2)}ms`,
      memoryDelta: `${(metrics.memoryUsage / 1024).toFixed(1)}KB`,
    });
  }

  return null;
}
