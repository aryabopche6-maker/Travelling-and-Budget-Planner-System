import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

// Curated particle positions to avoid random re-renders
const PARTICLES = [
  { top: '10%', left: '20%', size: '6px', delay: '0s', duration: '12s', opacity: 0.2 },
  { top: '25%', left: '80%', size: '4px', delay: '2s', duration: '10s', opacity: 0.15 },
  { top: '40%', left: '15%', size: '8px', delay: '4s', duration: '14s', opacity: 0.25 },
  { top: '60%', left: '70%', size: '5px', delay: '1s', duration: '11s', opacity: 0.15 },
  { top: '75%', left: '30%', size: '7px', delay: '5s', duration: '13s', opacity: 0.2 },
  { top: '85%', left: '85%', size: '4px', delay: '3s', duration: '9s', opacity: 0.15 },
  { top: '15%', left: '60%', size: '5px', delay: '6s', duration: '12s', opacity: 0.2 },
  { top: '50%', left: '45%', size: '9px', delay: '0.5s', duration: '15s', opacity: 0.3 },
  { top: '90%', left: '10%', size: '6px', delay: '2.5s', duration: '10s', opacity: 0.2 },
  { top: '35%', left: '90%', size: '5px', delay: '7s', duration: '14s', opacity: 0.15 },
  { top: '5%', left: '40%', size: '7px', delay: '1.5s', duration: '11s', opacity: 0.25 },
  { top: '70%', left: '15%', size: '4px', delay: '4.5s', duration: '13s', opacity: 0.15 },
  { top: '80%', left: '55%', size: '8px', delay: '3.5s', duration: '12s', opacity: 0.2 },
  { top: '20%', left: '5%', size: '5px', delay: '8s', duration: '14s', opacity: 0.15 },
  { top: '95%', left: '75%', size: '6px', delay: '1s', duration: '10s', opacity: 0.2 }
];

export default function AtmosphericBackground({ variant = 'default' }) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Gentle scroll parallax using springs for smoothness
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const ySlow = useSpring(useTransform(scrollY, [0, 1000], [0, 50]), springConfig);
  const yMedium = useSpring(useTransform(scrollY, [0, 1000], [0, 80]), springConfig);
  const yFast = useSpring(useTransform(scrollY, [0, 1000], [0, 120]), springConfig);

  // Mouse Parallax
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || prefersReducedMotion) return;
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; 
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Variant configs
  const showGradients = ['destination', 'how-it-works', 'budget', 'default'].includes(variant);
  const showWaves = ['destination', 'default'].includes(variant);
  const showParticles = ['destination', 'default'].includes(variant);
  const showRoute = ['destination', 'itinerary', 'default'].includes(variant);
  const showTopo = ['destination', 'itinerary', 'default'].includes(variant);
  const showSun = ['destination', 'budget', 'default'].includes(variant);
  
  if (variant === 'minimal' || variant === 'safety') {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#EEF8FC] opacity-70" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. Base Layer */}
      <div className="absolute inset-0 bg-[#EEF8FC]" />

      {/* 2. Ambient Gradients */}
      {showGradients && (
        <motion.div 
          style={{ 
            y: prefersReducedMotion ? 0 : ySlow,
            x: prefersReducedMotion ? 0 : mousePosition.x * 0.5
          }} 
          className="absolute inset-0"
        >
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#14B8A6] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.06] animate-ambient" />
          <div className="absolute top-[30%] -right-[10%] w-[50%] h-[70%] bg-[#BFE8F2] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.1] animate-ambient-fast" />
          <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[60%] bg-[#FF6B4A] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.04] animate-ambient" style={{ animationDelay: '2s' }} />
        </motion.div>
      )}

      {/* 3. Sun/Light Glow */}
      {showSun && (
        <motion.div 
          style={{ y: prefersReducedMotion ? 0 : yMedium }}
          className="absolute inset-0"
        >
          <div className="absolute top-[10%] left-[40%] w-[80vw] h-[80vw] rounded-full bg-white filter blur-[80px] opacity-40 animate-sun mix-blend-overlay" />
        </motion.div>
      )}

      {/* 4. Topographic Lines */}
      {showTopo && (
        <motion.div 
          className="absolute inset-0"
          style={{
            y: prefersReducedMotion ? 0 : ySlow,
            opacity: 0.04,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 40c25 0 45 20 49 45 3 20 15 36 32 45 23 12 40 23 60 23 3 0 5 2 5 5s-2 5-5 5c-23 0-42-12-58-30-15-18-23-37-26-60-3-26-23-43-48-43-3 0-5-2-5-5s2-5 5-5z' fill='%230F766E' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            backgroundSize: "400px 400px"
          }}
        />
      )}

      {/* 5. Flowing Waves */}
      {showWaves && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <svg className="absolute w-[150%] h-[150%] animate-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#14B8A6" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      )}

      {/* 6. Travel Route */}
      {showRoute && (
        <motion.div 
          style={{ y: prefersReducedMotion ? 0 : yFast }}
          className="absolute inset-0 opacity-[0.12] flex items-center justify-center"
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <path 
              d="M 100,500 C 300,400 400,600 600,300 S 800,400 1000,200" 
              fill="transparent" 
              stroke="#0F766E" 
              strokeWidth="2" 
              strokeDasharray="6 8" 
              className={!prefersReducedMotion ? "animate-route" : ""} 
            />
          </svg>
        </motion.div>
      )}

      {/* 7. Particles */}
      {showParticles && !prefersReducedMotion && (
        <motion.div 
          style={{ 
            y: yFast,
            x: mousePosition.x * -1 // Opposite direction for depth
          }} 
          className="absolute inset-0"
        >
          {PARTICLES.map((p, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-particle"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
