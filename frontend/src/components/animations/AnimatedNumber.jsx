import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

export default function AnimatedNumber({ value, prefix = "", suffix = "", delay = 0, duration = 2000 }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Clean string inputs to numbers if they are strings like "45000"
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g,"")) : value;
  
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 15,
    mass: 1
  });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        springValue.set(numValue);
      }, delay * 1000);
    }
  }, [isInView, numValue, springValue, delay]);

  const display = useTransform(springValue, (current) => {
    return `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
  });

  return (
    <motion.span ref={ref}>
      {display}
    </motion.span>
  );
}
