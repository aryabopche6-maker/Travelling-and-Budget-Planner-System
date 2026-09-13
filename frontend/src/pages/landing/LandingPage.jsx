import React, { useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import AtmosphericBackground from '../../components/common/AtmosphericBackground';
import { Link } from 'react-router-dom';
import {
  Compass, ArrowRight, ArrowUpRight, Wallet, Users, Map,
  ShieldAlert, Sparkles, Globe, ChevronDown, Star, CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';
import MagneticButton from '../../components/animations/MagneticButton';
import Reveal from '../../components/animations/Reveal';
import ImageReveal from '../../components/animations/ImageReveal';

/* ── Destination data ──────────────────────────────────────────────────── */
const DESTINATIONS = [
  { name: 'Goa', tag: 'Beach · Nightlife', desc: 'Sunsets, seafood & shores', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop', budget: '₹18k–35k' },
  { name: 'Manali', tag: 'Mountains · Adventure', desc: 'Himalayan roads & snow', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop', budget: '₹22k–42k' },
  { name: 'Kerala', tag: 'Nature · Culture', desc: 'Backwaters & spice trails', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop', budget: '₹20k–38k' },
  { name: 'Jaipur', tag: 'Heritage · Culture', desc: 'Forts, palaces & colour', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop', budget: '₹15k–28k' },
  { name: 'Bali', tag: 'International · Tropical', desc: 'Temples, rice fields & surf', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', budget: '₹45k–80k' },
  { name: 'Meghalaya', tag: 'Nature · Offbeat', desc: 'Living roots & cloud forests', img: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=800&auto=format&fit=crop', budget: '₹20k–35k' },
];

/* ── How it works steps ──────────────────────────────────────────────── */
const HOW_STEPS = [
  { n: '01', title: 'Discover', desc: 'Pick a destination or let WanderPlan surprise you based on your mood and budget.', icon: <Globe className="w-6 h-6" /> },
  { n: '02', title: 'Plan', desc: 'Build your itinerary, compare hotels, forecast weather and find hidden costs — all in one view.', icon: <Map className="w-6 h-6" /> },
  { n: '03', title: 'Travel', desc: 'Share the plan with your group, split expenses fairly and stay safe with SOS whenever you need.', icon: <Compass className="w-6 h-6" /> },
];

/* ── Features ────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Wallet className="w-5 h-5" />, title: 'Smart Budget', desc: 'Track every rupee. Get real-time cost breakdowns and instant saving alternatives.' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'What-If Simulator', desc: 'Change hotel, days or group size and instantly see the impact on your budget.' },
  { icon: <Users className="w-5 h-5" />, title: 'Group Voting', desc: 'Stop the group-chat chaos. Vote on hotels, places and dates in one shared poll.' },
  { icon: <Map className="w-5 h-5" />, title: 'Auto Itinerary', desc: 'WanderPlan builds a day-by-day itinerary from your preferences and places.' },
  { icon: <ShieldAlert className="w-5 h-5" />, title: 'SOS Safety', desc: 'One tap shares your live GPS with every trip member. Stay safe, always.' },
  { icon: <Globe className="w-5 h-5" />, title: 'Hidden Costs', desc: 'Taxes, resort fees, tolls — we surface the real trip cost before you commit.' },
];

/* ── DestinationCard ─────────────────────────────────────────────────── */
function DestinationCard({ dest, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <Link to="/signup" className="block group">
        <div className="relative rounded-2xl overflow-hidden img-zoom-wrap shadow-travel hover:shadow-travel-lg transition-shadow duration-500 cursor-pointer">
          <div className="h-72 md:h-80 bg-bg">
            <img
              src={dest.img}
              alt={dest.name}
              loading="lazy"
              className="w-full h-full object-cover zoom-target"
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 dest-overlay" />
          {/* Tag chip */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold rounded-full">
              {dest.tag}
            </span>
          </div>
          {/* Arrow on hover */}
          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/0 border border-white/0 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/30">
            <ArrowUpRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-2xl font-bold text-white font-display text-shadow mb-0.5 group-hover:text-bright transition-colors duration-300">{dest.name}</h3>
            <p className="text-white/80 text-sm mb-2">{dest.desc}</p>
            <span className="text-white/60 text-xs font-medium">{dest.budget}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  // Parallax: image moves up slowly as user scrolls
  const heroImgY = useTransform(scrollY, [0, 600], shouldReduceMotion ? [0, 0] : [0, 80]);

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between border-b border-white/10 bg-charcoal/30 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-teal/30">
            <Compass className="text-white w-4.5 h-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight font-display">WanderPlan</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-white/70 hover:text-white transition-colors text-sm font-medium hidden sm:block">
            Sign In
          </Link>
          <Link to="/signup">
            <button className="px-5 py-2.5 bg-teal hover:bg-teal-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-teal/30 hover:shadow-lg">
              Get Started
            </button>
          </Link>
        </nav>
      </motion.header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex flex-col justify-end overflow-hidden">
        {/* Background image with parallax */}
        <motion.div
          style={{ y: heroImgY }}
          className="absolute inset-0 scale-110 origin-center"
        >
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop"
            alt="Beautiful mountain landscape for WanderPlan"
            className="w-full h-full object-cover object-center"
            fetchpriority="high"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Subtle top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-ocean/30 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 pb-20 md:pb-28 w-full">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-bright" />
            <span className="text-sm text-white/90 font-medium">AI-Powered Travel Planning</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.03] tracking-tight mb-6 text-white drop-shadow-md"
          >
            Your next adventure<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden via-coral to-bright [text-shadow:0_0_30px_rgba(255,107,74,0.5)]">starts here.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed"
          >
            Plan your destination, budget, itinerary and group trip — all in one beautiful place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/signup">
              <MagneticButton className="btn-shine inline-flex items-center gap-2 px-8 py-4 bg-teal hover:bg-bright text-white text-base font-semibold rounded-xl shadow-teal/30 hover:shadow-lg transition-all duration-300">
                Start Your Adventure
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
            <button
              onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-base font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              Explore WanderPlan
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURED DESTINATIONS ────────────────────────────────── */}
      <section id="destinations" className="py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
        <AtmosphericBackground variant="destination" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <p className="text-bright text-xs font-bold uppercase tracking-widest mb-3">Where will you go?</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-charcoal mb-4 tracking-tight">
              Destinations that inspire
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-muted mb-14 max-w-lg text-lg leading-relaxed">
              From Himalayan peaks to tropical coasts — discover your next adventure.
            </p>
          </Reveal>

          {/* Grid: 2 large + 4 smaller */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESTINATIONS.map((dest, i) => (
              <DestinationCard key={dest.name} dest={dest} delay={0.1 + i * 0.08} />
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mt-12 text-center">
              <Link to="/signup">
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-charcoal/10 text-charcoal/60 hover:text-charcoal hover:border-charcoal/40 rounded-xl text-sm font-medium transition-all duration-300">
                  View all destinations <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
        <AtmosphericBackground variant="how-it-works" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: image */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden img-zoom-wrap shadow-travel-lg">
                <div className="h-[480px]">
                  <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop"
                    alt="Traveler on road trip with WanderPlan"
                    loading="lazy"
                    className="w-full h-full object-cover zoom-target"
                  />
                </div>
                {/* floating card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-travel-md border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-teal fill-teal" />
                    </div>
                    <div>
                      <p className="text-charcoal font-bold text-sm">Smart planning saves money</p>
                      <p className="text-muted text-xs">Average saving of ₹8,400 per trip</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: steps */}
            <div className="order-1 lg:order-2">
              <Reveal>
                <p className="text-teal text-xs font-bold uppercase tracking-widest mb-3">Simple. Powerful.</p>
                <h2 className="text-4xl md:text-5xl font-bold font-display text-charcoal mb-5 tracking-tight">
                  How WanderPlan works
                </h2>
                <p className="text-muted text-lg mb-12 leading-relaxed">
                  From inspiration to boarding pass — plan your entire trip in minutes.
                </p>
              </Reveal>
              <div className="space-y-8">
                {HOW_STEPS.map((step, i) => (
                  <Reveal key={step.n} delay={0.15 + i * 0.12}>
                    <div className="flex gap-5 group">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-charcoal text-white flex items-center justify-center shrink-0 shadow-travel group-hover:bg-teal transition-colors duration-300">
                          {step.icon}
                        </div>
                        {i < HOW_STEPS.length - 1 && (
                          <div className="w-px flex-1 bg-gradient-to-b from-charcoal/15 to-transparent mt-3" />
                        )}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-muted tracking-widest">{step.n}</span>
                          <h3 className="text-xl font-bold text-charcoal font-display">{step.title}</h3>
                        </div>
                        <p className="text-muted leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUDGET PLANNING ──────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
        <AtmosphericBackground variant="budget" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <p className="text-bright text-xs font-bold uppercase tracking-widest mb-3">Budget Intelligence</p>
                <h2 className="text-4xl md:text-5xl font-bold font-display text-charcoal mb-5 tracking-tight leading-tight">
                  Plan around<br />your budget
                </h2>
                <p className="text-muted text-lg mb-10 leading-relaxed">
                  Know the real cost before you commit. WanderPlan surfaces hidden fees, suggests smart alternatives and keeps every rupee accountable.
                </p>
              </Reveal>
              <div className="space-y-4">
                {[
                  'Real-time budget vs. spend tracker',
                  'Hidden costs revealed before you book',
                  'What-If simulator for budget changes',
                  'Smart alternatives to save money',
                  'Group expense splitting built-in',
                ].map((item, i) => (
                  <Reveal key={item} delay={0.1 + i * 0.07}>
                    <div className="flex items-center gap-3 text-charcoal/80">
                      <CheckCircle2 className="w-5 h-5 text-bright shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.5}>
                <Link to="/signup" className="btn-shine inline-flex items-center gap-2 mt-10 px-7 py-3.5 bg-teal hover:bg-bright text-charcoal font-semibold rounded-xl transition-all duration-300 shadow-teal/30">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Reveal>
            </div>

            {/* Budget card mockup */}
            <Reveal delay={0.2} direction="right">
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-travel-lg shadow-travel-lg p-6 space-y-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-charcoal font-display text-lg">Goa Escape · Budget</h3>
                    <span className="px-3 py-1 bg-teal/10 text-teal text-xs font-bold rounded-full border border-teal/20">Within Budget ✓</span>
                  </div>
                  {[
                    { label: 'Transport', val: 8500, total: 10000, color: 'bg-teal' },
                    { label: 'Hotels', val: 14000, total: 18000, color: 'bg-coral' },
                    { label: 'Food & Dining', val: 6000, total: 9000, color: 'bg-green' },
                    { label: 'Activities', val: 3200, total: 8000, color: 'bg-charcoal' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted font-medium">{row.label}</span>
                        <span className="text-charcoal font-bold">₹{row.val.toLocaleString()} <span className="text-muted font-normal">/ {(row.total/1000).toFixed(0)}k</span></span>
                      </div>
                      <div className="h-2 bg-bg rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(row.val / row.total) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                          className={`h-full rounded-full ${row.color}`}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-4 border-t border-bg">
                    <span className="text-muted text-sm">Total estimated</span>
                    <span className="text-2xl font-bold text-charcoal font-display">₹31,700</span>
                  </div>
                </div>
                {/* Floating savings badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-coral text-white rounded-2xl px-5 py-3 shadow-coral z-10 text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-wider opacity-90">Smart tip</p>
                  <p className="text-sm font-bold">Save ₹3,200 →</p>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ALL FEATURES GRID ────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
        <AtmosphericBackground variant="itinerary" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <p className="text-teal text-xs font-bold uppercase tracking-widest mb-3 text-center">Everything in one place</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-charcoal text-center mb-4 tracking-tight">
              Your complete travel toolkit
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-muted text-lg text-center mb-16 max-w-xl mx-auto leading-relaxed">
              From budgeting to group decisions to emergency SOS — WanderPlan has every journey covered.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={0.08 * i}>
                <div className="group bg-white hover:bg-[#F2F7F6] border border-muted/10 hover:border-charcoal/10 rounded-2xl p-6 transition-all duration-500 cursor-default shadow-travel hover:shadow-travel-lg">
                  <div className="w-11 h-11 bg-teal/10 group-hover:bg-teal/20 text-teal rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-charcoal font-display mb-2 transition-colors duration-300">{feat.title}</h3>
                  <p className="text-muted text-sm leading-relaxed transition-colors duration-300">{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GROUP PLANNING ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
        <AtmosphericBackground variant="default" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Right: image */}
            <div className="order-2 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden img-zoom-wrap shadow-travel-lg">
                <div className="h-[460px]">
                  <img
                    src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1000&auto=format&fit=crop"
                    alt="Group of travelers planning together"
                    loading="lazy"
                    className="w-full h-full object-cover zoom-target"
                  />
                </div>
                <div className="absolute inset-0 section-overlay" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex -space-x-3 mb-3">
                    {['A', 'S', 'R', 'M'].map((l, i) => (
                      <div key={l} className="w-10 h-10 rounded-full border-2 border-charcoal bg-teal/30 text-charcoal text-sm font-bold flex items-center justify-center backdrop-blur-sm" style={{ zIndex: 10 - i }}>{l}</div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-charcoal bg-charcoal/5 text-charcoal text-xs font-bold flex items-center justify-center backdrop-blur-sm">+3</div>
                  </div>
                  <p className="text-charcoal text-sm font-semibold text-shadow-sm">7 travelers. One plan.</p>
                </div>
              </div>
            </div>

            {/* Left: text */}
            <div className="order-1 lg:order-1">
              <Reveal>
                <p className="text-bright text-xs font-bold uppercase tracking-widest mb-3">Group Travel</p>
                <h2 className="text-4xl md:text-5xl font-bold font-display text-charcoal mb-5 leading-tight">
                  Plan with<br />your whole crew
                </h2>
                <p className="text-muted text-lg mb-10 leading-relaxed">
                  No more 300-message group chats. WanderPlan gives your group a shared space to vote, plan and split costs — fairly and transparently.
                </p>
              </Reveal>
              <div className="space-y-4">
                {[
                  'Group voting on hotels, places & dates',
                  'Shared itinerary everyone can edit',
                  'SplitSmart expense splitting',
                  'Role-based permissions (Admin / Traveler)',
                  'Real-time activity feed',
                ].map((item, i) => (
                  <Reveal key={item} delay={0.1 + i * 0.07}>
                    <div className="flex items-center gap-3 text-charcoal/80">
                      <CheckCircle2 className="w-5 h-5 text-bright shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOS / SAFETY ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
        <AtmosphericBackground variant="safety" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-charcoal mb-5 tracking-tight">
              Your safety matters
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              One tap activates SOS — sharing your live GPS location with every member of your trip. Because adventure is only worth it when everyone comes home safe.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="inline-flex items-center gap-4 bg-white text-charcoal px-6 border border-muted/10 py-4 rounded-2xl shadow-travel-lg">
              <div className="w-10 h-10 rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center">
                <span className="w-3 h-3 bg-danger rounded-full animate-pulse-slow" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">SOS Safety Center</p>
                <p className="text-muted text-xs">Live GPS · Group alerts · Emergency contact</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-40 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop"
            alt="Travelers looking at sunset over mountains"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-bold font-display text-white mb-6 tracking-tight text-shadow-lg leading-tight">
              Ready to start your<br />
              <span className="text-bright">next adventure?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-white/80 text-xl mb-10 leading-relaxed">
              Join travellers who plan smarter, spend less and enjoy every moment.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <MagneticButton className="btn-shine inline-flex items-center gap-2 px-10 py-4 bg-teal hover:bg-bright text-white text-lg font-semibold rounded-xl shadow-teal/30 transition-all duration-300">
                  Start Your Adventure
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link to="/login">
                <button className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                  Sign In
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-charcoal border-t border-white/5 py-10 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center">
              <Compass className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-white font-display">WanderPlan</span>
          </div>
          <p className="text-white/40 text-sm">© 2024 WanderPlan. Made for travellers, by travellers.</p>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link to="/login" className="hover:text-white/70 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white/70 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
