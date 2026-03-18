import { useState, useRef, useEffect } from 'react';
import { optimizeImageUrl } from '../lib/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Threshold for IntersectionObserver (0-1). Default 0.1 */
  threshold?: number;
  /** Optional width for optimizeImageUrl */
  width?: number;
  /** Optional height for optimizeImageUrl */
  height?: number;
}

export function LazyImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  threshold = 0.1,
  width,
  height,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const displaySrc = width || height ? optimizeImageUrl(src, width, height) : src;

  return (
    <span ref={imgRef} className={className} style={{ display: 'block', minHeight: 1 }}>
      {isInView && (
        <img
          src={displaySrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={onError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
          className={className}
        />
      )}
    </span>
  );
}
