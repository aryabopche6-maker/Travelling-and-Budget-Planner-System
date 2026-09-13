import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  className = '', 
  hoverLift = false,
  glass = false,
  gradientBorder = false,
  delay = 0,
  onClick,
  ...props 
}) {
  const baseClasses = "rounded-2xl relative overflow-hidden transition-all duration-300";
  const bgClasses = glass 
    ? "bg-white/90 backdrop-blur-md border border-muted/30 shadow-[0_8px_32px_0_rgba(7,26,36,0.06)]" 
    : "bg-white border border-muted/30 shadow-sm";
    
  const hoverClasses = hoverLift 
    ? "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-teal/50" 
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`${baseClasses} ${bgClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {gradientBorder && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal to-coral opacity-75" />
      )}
      {children}
    </motion.div>
  );
}
