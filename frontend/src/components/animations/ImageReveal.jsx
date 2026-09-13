import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ImageReveal({ src, alt, className = "", imgClassName = "", delay = 0, zoomOnHover = true }) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, delay, ease: [0.25, 0.25, 0, 1] }
    }
  };

  const clipVariants = {
    hidden: { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
    visible: { 
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transition: { duration: 0.8, delay, ease: [0.7, 0, 0.3, 1] } 
    }
  };

  const imageVariants = {
    hidden: { scale: 1.1 },
    visible: { 
      scale: 1,
      transition: { duration: 0.8, delay, ease: [0.7, 0, 0.3, 1] }
    }
  };

  if (shouldReduceMotion) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <motion.img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover ${imgClassName}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className={`relative overflow-hidden group ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={clipVariants}
    >
      <motion.img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover origin-center transition-transform duration-700 ease-out ${zoomOnHover ? 'group-hover:scale-105' : ''} ${imgClassName}`}
        variants={imageVariants}
      />
    </motion.div>
  );
}
