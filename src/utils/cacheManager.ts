/**
 * Cache Manager
 *
 * Intelligent caching with TTL, fallback strategies, and source tracking.
 * Use for reducing Supabase reads and improving perceived performance.
 */

export type CacheSource = 'supabase' | 'localStorage' | 'fallback';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  source: CacheSource;
}

interface CacheOptions {
  ttl?: number; // milliseconds
  source?: CacheSource;
  forceRefresh?: boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

class CacheManager {
  private cache = new Map<string, CacheItem<unknown>>();
  private config = {
    defaultTTL: DEFAULT_TTL,
    maxAge: MAX_AGE,
  };

  private isValid<T>(item: CacheItem<T>): boolean {
    const age = Date.now() - item.timestamp;
    return age < item.ttl && age < this.config.maxAge;
  }

  async get<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const { ttl = this.config.defaultTTL, source = 'supabase', forceRefresh = false } = options;
    const cached = this.cache.get(key) as CacheItem<T> | undefined;

    if (!forceRefresh && cached && this.isValid(cached)) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.set(key, data, ttl, source);
      return data;
    } catch (error) {
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL, source: CacheSource = 'supabase'): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      source,
    });
  }

  getSync<T>(key: string): T | null {
    const cached = this.cache.get(key) as CacheItem<T> | undefined;
    if (!cached) return null;
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();
