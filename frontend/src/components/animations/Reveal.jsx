import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ children, delay = 0, width = "fit-content", className = "", direction = "up" }) {
  const shouldReduceMotion = useReducedMotion();

  const getDirectionOffset = () => {
    switch(direction) {
      case "up": return { y: 30, x: 0 };
      case "down": return { y: -30, x: 0 };
      case "left": return { y: 0, x: 30 };
      case "right": return { y: 0, x: -30 };
      default: return { y: 30, x: 0 };
    }
  };

  const offset = getDirectionOffset();

  if (shouldReduceMotion) {
    return (
      <div style={{ width }} className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ width }} className={`relative overflow-visible ${className}`}>
      <motion.div
        initial={{ opacity: 0, ...offset }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.25, 0, 1] }} // smooth ease out
      >
        {children}
      </motion.div>
    </div>
  );
}
