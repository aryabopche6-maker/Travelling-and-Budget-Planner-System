import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export default function PageTransition({ children, variant = 'slideUp', className = '' }) {
  const selectedVariant = variants[variant] || variants.slideUp;

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={selectedVariant.transition}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
