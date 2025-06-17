import { ImageOff } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

type ImageProps = {
  id: string;
  src: string;
  thumbnail?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  blurDataURL?: string;
  onLoad?: (e?: Event) => void;
  onError?: (e?: Event) => void;
  lazy?: boolean;
  threshold?: number;
  rootMargin?: string;
  isDarkMode?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onLoad' | 'onError' | 'isDarkMode'>;

const OptimizedImage: React.FC<ImageProps> = ({
  id,
  src,
  thumbnail,
  alt = '',
  className = '',
  fallbackSrc = '',
  width,
  height,
  objectFit = 'cover',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px',
  isDarkMode,
  ...props
}) => {
  const [isInView, setIsInView] = useState(!lazy);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy, isInView, threshold, rootMargin]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setMainImageLoaded(true);
    onLoad?.(e.nativeEvent);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError) {
      setHasError(true);
      onError?.(e.nativeEvent);
    }
  };

  const containerStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    minHeight: height ? `${height}px` : '200px',
  };

  const blurImage = blurDataURL || thumbnail || src;

  return (
    <div
      ref={imgRef}
      key={'w-{id}'}
      className={`relative overflow-hidden bg-gray-200 ${className}`}
      style={containerStyle}
      role="img"
      aria-label={alt}
      {...props}
    >
      {/* Blur placeholder layer (always present until main image is ready) */}
      {isInView && !hasError && (
        <div
          className="absolute inset-0 transition-opacity duration-700 z-0"
          style={{
            backgroundImage: `url(${blurImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: mainImageLoaded ? 'blur(0px)' : 'blur(20px)',
            transform: mainImageLoaded ? 'scale(1)' : 'scale(1.05)',
            transition: 'filter 0.6s ease, transform 0.6s ease',
          }}
        />
      )}

      {/* Actual image (fades in over the blur) */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 z-10 ${
            mainImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit,
          }}
          onLoad={handleImageLoad}
          onError={(e) => {
            console.log("IMAGE LOAD ERROR", src, e)
            handleImageError(e)
          }}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}

      {/* Error fallback */}
      {hasError && (
          <div className={`
            absolute inset-0 z-20 flex items-center justify-center mr-[15%]
            ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <ImageOff
                className={`w-12 h-12 mx-auto mb-3 opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                strokeWidth={1.5}
              />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Failed to laod
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default OptimizedImage;
