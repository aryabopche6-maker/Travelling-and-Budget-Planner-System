import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export default function ParallaxImage({ src, alt, className = "", imgClassName = "", offset = 50 }) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Moves the image from -offset to +offset as it scrolls through the viewport
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`}>
        <img src={src} alt={alt} className={`w-full h-full object-cover ${imgClassName}`} />
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img 
        src={src} 
        alt={alt} 
        style={{ y, scale: 1.15 }} // scale up slightly so edges don't show when moving
        className={`w-full h-full object-cover origin-center will-change-transform ${imgClassName}`}
      />
    </div>
  );
}
