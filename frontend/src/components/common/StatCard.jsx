import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Card from './Card';

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel, 
  delay = 0,
  isCurrency = false,
  color = 'teal' 
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    let startTime;
    const duration = 1500;
    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g,""));
    
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const animateValue = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function: easeOutExpo
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setDisplayValue(numericValue * easeOut);
      
      if (percentage < 1) {
        requestAnimationFrame(animateValue);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [value]);

  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayValue)
    : (typeof value === 'number' ? Math.round(displayValue).toLocaleString() : displayValue);

  const colorClasses = {
    teal: 'text-teal bg-teal/10',
    coral: 'text-coral bg-coral/10',
    sand: 'text-sand-600 bg-bg/10',
    blue: 'text-blue-400 bg-blue-500/10'
  };

  return (
    <Card delay={delay} className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted mb-1">{title}</p>
          <motion.h3 
            className="text-2xl font-bold text-charcoal tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {formattedValue}
          </motion.h3>
          
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                trend > 0 ? 'bg-golden/20 text-golden-700' : 'bg-success/20 text-success'
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-xs text-muted">{trendLabel}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color] || colorClasses.teal}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
