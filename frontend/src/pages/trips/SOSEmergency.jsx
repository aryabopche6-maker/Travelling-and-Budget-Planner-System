import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Phone, CheckCircle, Radio } from 'lucide-react';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';

export default function SOSEmergency() {
  const [isPressing, setIsPressing] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const controls = useAnimation();
  const pressTimer = useRef(null);
  const progressRef = useRef(null);
  const watchIdRef = useRef(null);

  const startPress = () => {
    if (sosActive) return;
    setIsPressing(true);
    setHoldProgress(0);
    
    // Animate progress
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 3000, 1);
      setHoldProgress(progress);
      if (progress < 1) {
        progressRef.current = requestAnimationFrame(animate);
      }
    };
    progressRef.current = requestAnimationFrame(animate);
    
    controls.start({
      scale: 1.08,
      boxShadow: "0px 0px 60px 25px rgba(239, 68, 68, 0.5)",
      borderColor: "rgba(239, 68, 68, 1)",
      transition: { duration: 3 }
    });
    
    pressTimer.current = setTimeout(() => {
      activateSOS();
    }, 3000);
  };

  const cancelPress = () => {
    if (sosActive) return;
    setIsPressing(false);
    setHoldProgress(0);
    clearTimeout(pressTimer.current);
    cancelAnimationFrame(progressRef.current);
    controls.start({
      scale: 1,
      boxShadow: "0px 0px 0px 0px rgba(239, 68, 68, 0)",
      borderColor: "rgba(239, 68, 68, 0.5)",
      transition: { duration: 0.3 }
    });
  };

  const activateSOS = () => {
    setIsPressing(false);
    setHoldProgress(0);
    cancelAnimationFrame(progressRef.current);
    setSosActive(true);
    
    // Start getting location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(4),
            lng: position.coords.longitude.toFixed(4)
          });
        },
        (error) => {
          setLocation({ error: 'Location access denied' });
        }
      );
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(4),
            lng: position.coords.longitude.toFixed(4)
          });
        },
        (error) => console.warn(error),
        { enableHighAccuracy: true }
      );
    }
  };

  const deactivateSOS = () => {
    setSosActive(false);
    setLocation(null);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    controls.set({ scale: 1, boxShadow: "0px 0px 0px 0px rgba(239, 68, 68, 0)", borderColor: "rgba(239, 68, 68, 0.5)" });
  };

  useEffect(() => {
    return () => {
      clearTimeout(pressTimer.current);
      cancelAnimationFrame(progressRef.current);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // SVG ring progress
  const circumference = 2 * Math.PI * 126; // radius ~126 for our button size
  const strokeDashoffset = circumference * (1 - holdProgress);

  return (
    <PageTransition variant="slideUp" className="max-w-4xl mx-auto space-y-8 pb-12">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center shrink-0 border border-danger/20 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">Emergency SOS</h1>
              <p className="text-muted mt-1">For critical situations only. Notify your group immediately.</p>
            </div>
          </div>
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        {!sosActive ? (
          <motion.div 
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-6 md:py-10"
          >
            <div className="relative mb-16 mt-8">
              {/* Pulsing rings when pressing */}
              <AnimatePresence>
                {isPressing && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: [0.5, 0], scale: [1, 2] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                      className="absolute inset-0 bg-red-500 rounded-full z-0"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: [0.3, 0], scale: [1, 2.5] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      className="absolute inset-0 bg-red-500 rounded-full z-0"
                    />
                  </>
                )}
              </AnimatePresence>
              
              {/* Progress Ring SVG */}
              {isPressing && (
                <svg 
                  className="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none"
                  viewBox="0 0 264 264"
                >
                  <circle
                    cx="132"
                    cy="132"
                    r="126"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.8)"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                  />
                </svg>
              )}
              
              <motion.button
                animate={controls}
                initial={{ borderColor: "rgba(228, 91, 91, 0.5)" }}
                onMouseDown={startPress}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={startPress}
                onTouchEnd={cancelPress}
                className="relative z-10 w-56 h-56 md:w-64 md:h-64 bg-white border-[6px] rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(228,91,91,0.15)] active:bg-danger/5 transition-colors select-none group cursor-pointer"
              >
                <div className="absolute inset-0 rounded-full border border-danger/20 m-2 pointer-events-none" />
                <motion.div
                  animate={isPressing ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={isPressing ? { repeat: Infinity, duration: 0.8 } : {}}
                >
                  <ShieldAlert className="w-16 h-16 md:w-20 md:h-20 text-danger mb-3" />
                </motion.div>
                <span className="text-3xl font-black text-danger tracking-widest drop-shadow-sm">SOS</span>
                <span className="text-sm text-danger/80 mt-3 font-bold uppercase tracking-wider">Hold 3 Seconds</span>
              </motion.button>
            </div>
            
            <Reveal delay={0.2}>
              <Card className="w-full max-w-2xl bg-bg border-muted/30">
                <h3 className="font-bold text-lg mb-6 text-charcoal flex items-center gap-2">
                  <Radio className="w-5 h-5 text-muted" /> What happens when activated?
                </h3>
                <ul className="space-y-5 text-sm text-muted">
                  {[
                    { step: 1, title: 'Location Access', desc: 'Requests precise GPS coordinates from your device immediately to track your position.' },
                    { step: 2, title: 'Urgent Notifications', desc: 'Sends an un-mutable push notification and SMS alert to all admin and members of this trip.' },
                    { step: 3, title: 'Live Tracking', desc: 'Continuously broadcasts your live location to the group until you manually mark yourself as safe.' }
                  ].map((item, i) => (
                    <motion.li 
                      key={item.step}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex items-start gap-4 bg-white p-4 rounded-xl border border-muted/30 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-danger/10 border border-danger/20 text-danger font-bold flex items-center justify-center shrink-0">{item.step}</div>
                      <div>
                        <p className="font-bold text-charcoal mb-1 text-base">{item.title}</p>
                        <p className="text-muted leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            {/* Pulsing red border glow */}
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 30px rgba(228, 91, 91, 0.15)",
                  "0 0 60px rgba(228, 91, 91, 0.3)",
                  "0 0 30px rgba(228, 91, 91, 0.15)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="bg-red-50 border-2 border-danger rounded-3xl p-6 md:p-12 text-center relative overflow-hidden"
            >
              <motion.div 
                animate={{ opacity: [0.01, 0.04, 0.01] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-danger" 
              />
              
              <div className="relative z-10 max-w-xl mx-auto">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-24 h-24 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(228,91,91,0.5)]"
                >
                  <ShieldAlert className="w-12 h-12 text-danger" />
                </motion.div>
                
                <h2 className="text-4xl font-black text-danger mb-3 tracking-tight">SOS Activated</h2>
                <p className="text-danger/80 mb-10 text-lg font-medium">Your trusted trip members have been notified and can see your location.</p>
                
                <Card glass className="bg-white/80 p-6 rounded-2xl border-danger/30 text-left mb-10 shadow-lg shadow-danger/10 backdrop-blur-md">
                  <h3 className="font-bold text-charcoal mb-6 uppercase tracking-wider text-sm">Live Broadcast Status</h3>
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-4 bg-bg/50 p-4 rounded-xl border border-muted/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-muted/50">
                        <MapPin className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal mb-1">GPS Location Tracking</p>
                        {location ? (
                          location.error ? (
                            <p className="text-sm font-bold text-golden flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-golden"></span> {location.error}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-teal flex items-center gap-2">
                              <motion.span 
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-2 h-2 rounded-full bg-teal"
                              />
                              Active (Lat: {location.lat}, Lng: {location.lng})
                            </p>
                          )
                        ) : (
                          <p className="text-sm font-bold text-muted flex items-center gap-2">
                            <motion.span 
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="w-2 h-2 rounded-full bg-muted"
                            />
                            Acquiring satellite signal...
                          </p>
                        )}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-4 bg-bg/50 p-4 rounded-xl border border-muted/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-muted/50">
                        <Phone className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal mb-1">Notified Contacts</p>
                        <p className="text-sm font-medium text-golden flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-golden"></span> (Mocked) Notification queued
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </Card>

                <Button 
                  size="lg" 
                  onClick={deactivateSOS} 
                  className="bg-success hover:bg-success/90 text-white w-full sm:w-auto px-12 py-4 h-auto text-lg shadow-[0_0_30px_rgba(46,155,114,0.3)] gap-3 rounded-xl border border-success/30"
                >
                  <CheckCircle className="w-6 h-6" /> I am Safe Now
                </Button>
                <p className="text-sm text-muted mt-5 font-medium">Marking yourself safe will stop location sharing and notify the group.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
