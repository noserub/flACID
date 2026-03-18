/**
 * Memory Optimization Utilities
 *
 * Helpers for reducing memory usage and cleaning corrupted data.
 */

/**
 * Remove duplicate items from an array by a given key.
 * Keeps the first occurrence of each unique key value.
 */
export function cleanupDuplicates<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<T[keyof T]>();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Clear corrupted JSON data from localStorage.
 * Removes keys that fail to parse as valid JSON.
 */
export function clearCorruptedData(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          JSON.parse(value);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning corrupted data:', error);
  }
}
