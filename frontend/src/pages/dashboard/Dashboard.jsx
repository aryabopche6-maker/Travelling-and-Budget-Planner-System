import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wallet, Compass, Plus, Activity, BellRing, Plane, Sparkles, TrendingUp, Clock, ArrowRight, Globe, Map, Calendar, Users, IndianRupee, Zap, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Reveal from '../../components/animations/Reveal';
import MagneticButton from '../../components/animations/MagneticButton';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/tripService';
import { getDestinationImage } from '../../utils/destinationImages';

/* ── Animation Variants ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const slideRight = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

/* ── Floating Particle Component ── */
function FloatingParticle({ delay = 0, size = 4, color = 'rgba(20,184,166,0.3)', top, left }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, top, left, filter: 'blur(1px)' }}
      animate={{
        y: [0, -40, -80, -40, 0],
        x: [0, 15, -10, 20, 0],
        opacity: [0, 0.6, 1, 0.6, 0],
        scale: [0.5, 1, 1.2, 1, 0.5]
      }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ── Animated Counter ── */
function AnimatedValue({ value, isCurrency = false }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start;
    const dur = 1800;
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) { setDisplay(value); return; }
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(num * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  if (isCurrency) return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(display);
  return typeof value === 'number' ? Math.round(display).toLocaleString() : display;
}

/* ── Greeting based on time ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

/* ── Quick Action Data ── */
const quickActions = [
  { name: 'New Trip', desc: 'Plan your next adventure', icon: Plus, path: '/trips/new', gradient: 'from-teal-500 to-emerald-400', shadow: 'shadow-teal-500/25', iconBg: 'bg-white/20' },
  { name: 'Surprise Me', desc: 'Get inspired randomly', icon: Sparkles, path: '/surprise-me', gradient: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/25', iconBg: 'bg-white/20' },
  { name: 'My Trips', desc: 'View all your trips', icon: Map, path: '/trips', gradient: 'from-violet-500 to-purple-400', shadow: 'shadow-violet-500/25', iconBg: 'bg-white/20' },
  { name: 'Budget', desc: 'Track your spending', icon: Wallet, path: '/trips', gradient: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/25', iconBg: 'bg-white/20' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingTrip, setUpcomingTrip] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const greeting = getGreeting();

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const trips = await tripService.getMyTrips(user?.id);
        if (isMounted) {
          if (trips && trips.length > 0) {
            setUpcomingTrip(trips[0]);
            setAllTrips(trips);
          } else {
            setUpcomingTrip(null);
            setAllTrips([]);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard trips:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => { isMounted = false; };
  }, [user?.id]);

  const totalBudget = allTrips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalSpent = allTrips.reduce((sum, t) => sum + (t.spent || 0), 0);
  const budgetPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-teal/20 border-t-teal"
        />
      </div>
    );
  }

  return (
    <PageTransition variant="fade" className="pb-8">
      {/* ═══════════════════ HERO WELCOME SECTION ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl mb-8"
        style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 40%, #2DD4BF 70%, #0D9488 100%)',
          minHeight: 200,
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #F4B942 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FF6B4A 0%, transparent 70%)' }} />
        
        {/* Floating particles */}
        <FloatingParticle delay={0} size={6} color="rgba(255,255,255,0.4)" top="20%" left="10%" />
        <FloatingParticle delay={2} size={4} color="rgba(255,255,255,0.3)" top="60%" left="30%" />
        <FloatingParticle delay={4} size={8} color="rgba(255,255,255,0.2)" top="30%" left="70%" />
        <FloatingParticle delay={1} size={5} color="rgba(244,185,66,0.4)" top="50%" left="85%" />
        <FloatingParticle delay={3} size={3} color="rgba(255,255,255,0.5)" top="70%" left="50%" />

        {/* Animated wave SVG */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 50 }}>
          <motion.path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z"
            fill="rgba(238,248,252,0.15)"
            animate={{
              d: [
                "M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z",
                "M0,50 C360,20 720,60 1080,30 C1260,50 1380,40 1440,35 L1440,80 L0,80 Z",
                "M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z",
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Content */}
        <div className="relative z-10 px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.p 
              className="text-white/70 text-sm font-medium mb-1 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-lg">{greeting.emoji}</span> {greeting.text}
            </motion.p>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">{user?.name?.split(' ')[0] || 'Traveler'}</span>!
            </h1>
            <p className="text-white/60 mt-2 text-base max-w-md">
              Your next adventure is just around the corner. Let's make it unforgettable ✨
            </p>

            {/* Mini stats in hero */}
            <div className="flex gap-4 mt-5">
              <motion.div 
                className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.18)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Trips</p>
                <p className="text-white text-xl font-bold">{allTrips.length}</p>
              </motion.div>
              <motion.div 
                className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.18)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Budget Used</p>
                <p className="text-white text-xl font-bold">{budgetPercent}%</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
          >
            <Link to="/trips/new">
              <MagneticButton className="group relative px-7 py-3.5 rounded-2xl font-bold text-teal bg-white shadow-xl shadow-black/10 inline-flex items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                <span>Start Adventure</span>
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1), transparent)' }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════════════════ MAIN GRID LAYOUT ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── Left Column (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ── Quick Actions ── */}
          <Reveal delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Quick Actions
              </h2>
            </div>
            <motion.div 
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.div key={idx} variants={fadeUp}>
                    <Link to={action.name === 'Budget' && upcomingTrip ? `/trips/${upcomingTrip.id}/budget` : action.path} className="block group">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${action.gradient} ${action.shadow} shadow-lg cursor-pointer`}
                        style={{ minHeight: 130 }}
                      >
                        {/* Glow overlay */}
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500" />
                        
                        {/* Shine sweep */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                          }}
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />

                        <div className={`w-10 h-10 rounded-xl ${action.iconBg} backdrop-blur-sm flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-sm">{action.name}</h3>
                        <p className="text-white/60 text-xs mt-0.5">{action.desc}</p>
                        
                        {/* Arrow */}
                        <motion.div 
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ x: -5 }}
                          whileHover={{ x: 0 }}
                        >
                          <ArrowRight className="w-4 h-4 text-white/70" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </Reveal>

          {/* ── Your Next Adventure ── */}
          <Reveal delay={0.2}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display flex items-center gap-2 text-charcoal">
                <Plane className="w-5 h-5 text-teal" /> Your Next Adventure
              </h2>
              <Link to="/trips" className="text-sm text-teal hover:text-bright font-medium transition-colors flex items-center gap-1 group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {upcomingTrip ? (
              <Link to={`/trips/${upcomingTrip.id}`} className="block group">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative overflow-hidden rounded-2xl bg-white border border-white/50 shadow-lg hover:shadow-xl transition-shadow duration-500"
                >
                  {/* Image Section */}
                  <div className="relative h-52 overflow-hidden">
                    <motion.img
                      src={upcomingTrip.image || getDestinationImage(upcomingTrip.destination)}
                      alt={upcomingTrip.destination}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.8 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <motion.span 
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-teal shadow-lg"
                        animate={{ boxShadow: ['0 0 0px rgba(20,184,166,0.3)', '0 0 20px rgba(20,184,166,0.3)', '0 0 0px rgba(20,184,166,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {upcomingTrip.status || 'Planning'}
                      </motion.span>
                    </div>

                    {/* Destination Name on Image */}
                    <div className="absolute bottom-4 left-5 right-5">
                      <h3 className="text-2xl md:text-3xl font-bold text-white font-display text-shadow-lg tracking-tight">
                        {upcomingTrip.destination}
                      </h3>
                      <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(upcomingTrip.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – {new Date(upcomingTrip.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Info Bar */}
                  <div className="p-5 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-teal" />
                        </div>
                        <span className="font-medium">{Array.isArray(upcomingTrip.members) ? upcomingTrip.members.length : upcomingTrip.members} Travelers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <IndianRupee className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="font-medium">{(upcomingTrip.budget / 1000).toFixed(0)}k Budget</span>
                      </div>
                    </div>

                    {/* Budget Progress Circle */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-muted uppercase font-semibold tracking-wider">Progress</p>
                        <p className="text-sm font-bold text-charcoal">
                          {upcomingTrip.budget > 0 ? Math.round((upcomingTrip.spent / upcomingTrip.budget) * 100) : 0}%
                        </p>
                      </div>
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#EEF8FC" strokeWidth="3" />
                        <motion.circle
                          cx="20" cy="20" r="16" fill="none" stroke="#0F766E" strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={100.5}
                          initial={{ strokeDashoffset: 100.5 }}
                          animate={{ strokeDashoffset: 100.5 - (100.5 * Math.min((upcomingTrip.spent / upcomingTrip.budget) * 100, 100) / 100) }}
                          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-10 border-2 border-dashed border-teal/20 rounded-2xl bg-gradient-to-br from-teal/5 to-emerald-50/50 text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Globe className="w-12 h-12 text-teal/40 mx-auto mb-3" />
                </motion.div>
                <p className="text-charcoal font-semibold text-lg">No upcoming trips yet!</p>
                <p className="text-muted text-sm mt-1 mb-4">Start planning your dream adventure today</p>
                <Link to="/trips/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white font-medium text-sm hover:bg-bright transition-colors shadow-lg shadow-teal/20">
                  <Plus className="w-4 h-4" /> Create Your First Trip
                </Link>
              </motion.div>
            )}
          </Reveal>
        </div>

        {/* ── Right Column (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ── Budget Overview Card ── */}
          <Reveal delay={0.25} direction="right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Budget Overview
              </h2>
            </div>
            
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="rounded-2xl overflow-hidden border border-white/50 shadow-lg bg-white"
            >
              {/* Gradient Top Section */}
              <div className="p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}>
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />
                
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Total Planned</p>
                <motion.p
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <AnimatedValue value={totalBudget} isCurrency />
                </motion.p>
              </div>

              {/* Spent Section */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted font-medium">Total Spent</p>
                    <p className="text-xl font-bold text-charcoal">
                      <AnimatedValue value={totalSpent} isCurrency />
                    </p>
                  </div>
                  <motion.div 
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      budgetPercent > 85 ? 'bg-red-50 text-red-500' : budgetPercent > 50 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {budgetPercent}% used
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: budgetPercent > 85
                          ? 'linear-gradient(90deg, #ef4444, #f87171)'
                          : budgetPercent > 50
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #0F766E, #14B8A6)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
                      transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Remaining */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-muted">Remaining</span>
                  <span className="text-sm font-bold text-emerald-600">
                    <AnimatedValue value={Math.max(totalBudget - totalSpent, 0)} isCurrency />
                  </span>
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* ── Recent Activity ── */}
          <Reveal delay={0.35} direction="right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-500" /> Recent Activity
              </h2>
            </div>
            
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="rounded-2xl overflow-hidden border border-white/50 shadow-lg bg-white"
            >
              {allTrips.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {allTrips.slice(0, 3).map((trip, index) => (
                    <motion.div
                      key={trip.id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="group p-4 hover:bg-gradient-to-r hover:from-teal/5 hover:to-transparent transition-all duration-300 cursor-pointer"
                    >
                      <Link to={`/trips/${trip.id}`} className="flex items-start gap-3">
                        <div className="relative">
                          <motion.div 
                            className="w-2.5 h-2.5 mt-1.5 rounded-full shrink-0"
                            style={{
                              background: index === 0 ? 'linear-gradient(135deg, #0F766E, #14B8A6)' :
                                         index === 1 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' :
                                         'linear-gradient(135deg, #8b5cf6, #a78bfa)'
                            }}
                            animate={index === 0 ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-charcoal group-hover:text-teal transition-colors truncate">{trip.destination}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {new Date(trip.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – {new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-semibold text-muted bg-gray-50 px-2 py-0.5 rounded-full">
                              {trip.status || 'Planning'}
                            </span>
                            <span className="text-[10px] text-muted">
                              ₹{((trip.budget || 0) / 1000).toFixed(0)}k budget
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted/40 group-hover:text-teal group-hover:translate-x-1 transition-all mt-1 shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted">No activity yet. Start a trip!</p>
                </div>
              )}
              
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 border-t border-gray-100 text-center">
                <Link to="/trips" className="text-xs text-teal hover:text-bright font-semibold transition-colors inline-flex items-center gap-1">
                  View All Trips <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </Reveal>

          {/* ── Inspiration Card ── */}
          <Reveal delay={0.45} direction="right">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="rounded-2xl overflow-hidden shadow-lg relative"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}
            >
              {/* Sparkles animation */}
              <motion.div
                className="absolute top-4 right-6"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-amber-300/70" />
              </motion.div>

              <div className="p-6 relative z-10">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">✨ Feeling Lucky?</p>
                <h3 className="text-white font-bold text-lg font-display mb-2">Surprise Me</h3>
                <p className="text-white/50 text-xs mb-4">Let us pick a random dream destination for your next trip!</p>
                <Link to="/surprise-me">
                  <motion.button 
                    className="w-full py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Explore Now →
                  </motion.button>
                </Link>
              </div>

              {/* Decorative */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-amber-400/10" />
              <div className="absolute top-1/2 -left-8 w-16 h-16 rounded-full bg-violet-400/10" />
            </motion.div>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
