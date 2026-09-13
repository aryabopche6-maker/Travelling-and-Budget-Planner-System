import React from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../../context/TripContext';
import { CloudRain, Sun, Wallet, Users, Map, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageTransition from '../../components/common/PageTransition';
import Reveal from '../../components/animations/Reveal';
import AnimatedNumber from '../../components/animations/AnimatedNumber';
import ParallaxImage from '../../components/animations/ParallaxImage';
import { Link } from 'react-router-dom';
import { getDestinationImage } from '../../utils/destinationImages';

export default function TripDashboard() {
  const { trip, isTripAdmin } = useTrip();

  if (!trip) return null;

  const progressPercent = Math.min(((trip.spent || trip.spentBudget || 0) / (trip.budget || trip.totalBudget || 1)) * 100, 100);
  const isBudgetTight = progressPercent > 85;

  return (
    <PageTransition variant="fade" className="space-y-6 pb-8">
      {/* Hero Section with Parallax */}
      <Reveal>
        <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 shadow-2xl group">
          <ParallaxImage 
            src={trip.image || getDestinationImage(trip.destination)} 
            alt={trip.destination}
            className="w-full h-full"
            imgClassName="w-full h-full"
            offset={40}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-3 mb-2"
              >
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${
                  trip.status === 'Planning' ? 'bg-teal/30 text-bright border border-teal/30' : 'bg-coral/30 text-coral-300 border border-coral/30'
                }`}>
                  {trip.status}
                </span>
                {isTripAdmin && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md">
                    Trip Admin
                  </span>
                )}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-lg"
              >
                {trip.destination}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="text-lg text-muted font-medium drop-shadow-md"
              >
                {new Date(trip.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} 
                {' — '} 
                {new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center gap-4 bg-navy-900/80 backdrop-blur-md p-4 rounded-2xl border border-navy-700/50"
            >
              <div className="text-center">
                <p className="text-sm text-muted font-medium mb-1">Travelers</p>
                <div className="flex items-center justify-center -space-x-2">
                  {trip.members.slice(0, 3).map((m, i) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300 }}
                      className="w-8 h-8 rounded-full border-2 border-navy-800 bg-teal/20 text-teal flex items-center justify-center text-xs font-bold z-10" 
                      style={{ zIndex: 10 - i }}
                    >
                      {m.name.charAt(0)}
                    </motion.div>
                  ))}
                  {trip.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-navy-800 bg-navy-700 text-muted flex items-center justify-center text-xs font-bold z-0">
                      +{trip.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Reveal>

      {/* Alerts / Budget Warning */}
      {isBudgetTight && (
        <Reveal delay={0.2}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-coral/10 border border-coral/30 rounded-2xl p-4 flex items-start gap-4"
          >
            <div className="p-2 bg-coral/20 rounded-full text-coral mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-coral font-bold mb-1">Budget Alert: Nearing Limit</h4>
              <p className="text-sm text-coral-100/80">You have spent {Math.round(progressPercent)}% of your planned budget. Check Smart Alternatives for savings.</p>
            </div>
            <Link to={`/trips/${trip.id}/alternatives`}>
              <Button size="sm" className="bg-coral hover:bg-coral-600 text-white shadow-lg shadow-coral/20">View Alternatives</Button>
            </Link>
          </motion.div>
        </Reveal>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Overview */}
          <Reveal delay={0.1}>
            <Card glass delay={0.1} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-teal" /> Budget Status
                </h3>
                <Link to={`/trips/${trip.id}/budget`} className="text-sm text-teal hover:text-bright flex items-center gap-1 font-medium">
                  Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted mb-1">Total Budget</p>
                  <p className="text-xl font-bold text-charcoal">
                    ₹<AnimatedNumber value={(trip.budget || trip.totalBudget || 0) / 1000} suffix="k" delay={0.2} />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Spent</p>
                  <p className="text-xl font-bold text-charcoal">
                    ₹<AnimatedNumber value={(trip.spent || trip.spentBudget || 0) / 1000} suffix="k" delay={0.3} />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Remaining</p>
                  <p className="text-xl font-bold text-teal">
                    ₹<AnimatedNumber value={((trip.budget || trip.totalBudget || 0) - (trip.spent || trip.spentBudget || 0)) / 1000} suffix="k" delay={0.4} />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Hidden Costs</p>
                  <p className="text-xl font-bold text-golden">₹12.5k</p>
                </div>
              </div>

              <div className="relative pt-2">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted font-medium">Progress</span>
                  <span className={isBudgetTight ? "text-golden font-bold" : "text-teal font-bold"}>
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-bg rounded-full overflow-hidden border border-muted/50 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className={`h-full rounded-full relative ${isBudgetTight ? 'bg-golden' : 'bg-teal'}`}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-sm" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Planning Progress & Next Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal delay={0.2}>
              <Card delay={0.2} className="p-6 bg-white h-full border border-muted/30 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal">
                  <Map className="w-5 h-5 text-sand-600" /> Next on Itinerary
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-bg text-sand-600 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal mb-1">Visit Fushimi Inari</h4>
                    <p className="text-sm text-muted mb-2">Tomorrow, 09:00 AM</p>
                    <p className="text-xs text-muted line-clamp-2">The iconic shrine with thousands of vermilion torii gates.</p>
                  </div>
                </div>
                <Link to={`/trips/${trip.id}/itinerary`} className="block mt-4">
                  <Button variant="outline" className="w-full">View Full Itinerary</Button>
                </Link>
              </Card>
            </Reveal>

            <Reveal delay={0.3}>
              <Card delay={0.3} className="p-6 bg-white h-full border border-muted/30 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal">
                  <Users className="w-5 h-5 text-blue-500" /> Group Voting
                </h3>
                <div className="space-y-4">
                  <div className="bg-bg p-3 rounded-xl border border-muted/30">
                    <p className="text-sm font-medium mb-2 text-charcoal">Which hotel to book?</p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>2/4 voted</span>
                      <span className="text-teal font-medium">Closes in 2 days</span>
                    </div>
                  </div>
                  <Link to={`/trips/${trip.id}/voting`} className="block">
                    <Button variant="outline" className="w-full">Cast Your Vote</Button>
                  </Link>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weather Card */}
          <Reveal delay={0.4} direction="right">
            <Link to={`/trips/${trip.id}/weather`} className="block">
              <Card hoverLift delay={0.4} gradientBorder className="p-6 h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sun className="w-24 h-24 text-golden" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-muted font-bold tracking-wider text-xs uppercase mb-4 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" /> Forecast
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-charcoal tracking-tighter">28°</span>
                    <span className="text-yellow-600 font-medium">Mostly Sunny</span>
                  </div>
                  <p className="text-sm text-muted">Perfect weather for outdoor activities tomorrow.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-teal group-hover:text-teal-600 transition-colors relative z-10">
                  View detailed forecast <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            </Link>
          </Reveal>

          {/* Recent Trip Activity */}
          <Reveal delay={0.5} direction="right">
            <Card delay={0.5} className="p-0 border-muted/30 bg-white">
              <div className="p-4 border-b border-muted/30">
                <h3 className="font-bold text-charcoal">Recent Activity</h3>
              </div>
              <div className="divide-y divide-muted/50">
                {[
                  { user: 'Sarah', action: 'added a place to', target: 'Day 2' },
                  { user: 'Mike', action: 'logged expense', target: 'Dinner' },
                  { user: 'You', action: 'voted for', target: 'Hotel Sakura' }
                ].map((act, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                    className="p-4 flex items-start gap-3 hover:bg-bg/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-bg text-charcoal flex items-center justify-center text-xs font-bold shrink-0 border border-muted/50">
                      {act.user.charAt(0)}
                    </div>
                    <p className="text-sm text-muted leading-tight pt-1">
                      <span className="text-charcoal font-bold">{act.user}</span> {act.action} <span className="text-teal font-medium">{act.target}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
