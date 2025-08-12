import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageZoom.module.css';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
}

const ImageZoom: React.FC<ImageZoomProps> = ({
  src,
  alt,
  className = '',
  zoomScale = 2.5
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate zoom position based on mouse coordinates
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate relative position (0-1)
    const x = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const y = Math.max(0, Math.min(1, (e.clientY - top) / height));
    
    setPosition({ x, y });
  };

  // Reset state when component unmounts or image changes
  useEffect(() => {
    setIsZoomed(false);
    setPosition({ x: 0.5, y: 0.5 });
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${className} ${styles.imageZoomContainer}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Regular image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          isZoomed ? 'opacity-20' : 'opacity-100'
        }`}
      />
      
      {/* Zoomed image overlay */}
      {isZoomed && (
        <div
          className={`${styles.zoomedImage} absolute inset-0 pointer-events-none`}
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
            backgroundSize: `${zoomScale * 100}%`,
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
      
      {/* Zoom indicator */}
      <div className={`absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded transition-opacity ${
        isZoomed ? 'opacity-100' : 'opacity-0'
      }`}>
        {Math.round(zoomScale * 100)}% zoom
      </div>
    </div>
  );
};

export default ImageZoom;
