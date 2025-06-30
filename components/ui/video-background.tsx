'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoBackgroundProps {
  videos: string[];
  className?: string;
  overlay?: boolean;
  autoChange?: boolean;
  changeInterval?: number;
}

export function VideoBackground({ 
  videos, 
  className = "", 
  overlay = true, 
  autoChange = true,
  changeInterval = 300000 // 5 minutes
}: VideoBackgroundProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Set random initial video
    setCurrentVideoIndex(Math.floor(Math.random() * videos.length));
  }, [videos.length]);

  useEffect(() => {
    if (!autoChange) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, changeInterval);

    return () => clearInterval(interval);
  }, [autoChange, changeInterval, videos.length]);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
    // Try next video
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const changeVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        key={currentVideoIndex}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
          />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      )}

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Video Controls (optional) */}
      <div className="absolute bottom-4 right-4 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={changeVideo}
          className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
        >
          Change Scene
        </motion.button>
      </div>
    </div>
  );
}
