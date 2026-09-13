import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wallet, Compass, Plus, Activity, BellRing, Plane, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import TripCard from '../../components/common/TripCard';
import PageTransition from '../../components/common/PageTransition';
import Reveal from '../../components/animations/Reveal';
import MagneticButton from '../../components/animations/MagneticButton';
import { useAuth } from '../../context/AuthContext';

// Dummy data
const upcomingTrip = {
  id: 't1',
  destination: 'Kyoto, Japan',
  image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
  startDate: '2024-04-10',
  endDate: '2024-04-20',
  members: [
    { id: '1', name: 'You', role: 'TRIP_ADMIN' },
    { id: '2', name: 'Sarah M.', role: 'TRAVELER' },
    { id: '3', name: 'Raj K.', role: 'TRAVELER' },
    { id: '4', name: 'Priya D.', role: 'TRAVELER' },
  ],
  budget: 250000,
  spent: 120000,
  status: 'Planning',
  role: 'TRIP_ADMIN'
};

const recentActivities = [
  { id: 1, action: 'Added to itinerary', detail: 'Fushimi Inari Shrine', time: '2h ago', trip: 'Kyoto, Japan' },
  { id: 2, action: 'Expense logged', detail: 'Flight Tickets - ₹45,000', time: '5h ago', trip: 'Kyoto, Japan' },
  { id: 3, action: 'New member joined', detail: 'Sarah M.', time: '1d ago', trip: 'Goa Escape' },
];

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal border-r-transparent align-[-0.125em]" />
      </div>
    );
  }

  return (
    <PageTransition variant="fade" className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <Reveal>
          <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!</h1>
          <p className="text-muted mt-1 text-lg">Your next adventure is just around the corner.</p>
        </Reveal>
        <Reveal delay={0.15} direction="right">
          <div className="flex gap-3">
            <Link to="/trips/new">
              <MagneticButton className="btn-shine gap-2 bg-teal hover:bg-bright shadow-lg shadow-teal/30 inline-flex items-center px-5 py-2.5 rounded-lg font-medium text-white transition-colors">
                <Plus className="w-5 h-5" /> Start Adventure
              </MagneticButton>
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Focus) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Trip Hero */}
          <Reveal delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display flex items-center gap-2 text-charcoal"><Plane className="w-5 h-5 text-teal" /> Your Next Adventure</h2>
              <Link to="/trips" className="text-sm text-teal hover:text-bright font-medium transition-colors">View All Trips</Link>
            </div>
            <TripCard trip={upcomingTrip} role={upcomingTrip.role} />
          </Reveal>

          {/* Quick Actions */}
          <Reveal delay={0.2}>
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <motion.div 
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { name: 'Start Adventure', icon: <Plus className="w-5 h-5" />, path: '/trips/new', color: 'bg-teal/10 text-teal hover:bg-teal/20' },
                { name: 'Surprise Me', icon: <Sparkles className="w-5 h-5" />, path: '/surprise-me', color: 'bg-coral/10 text-coral hover:bg-coral/20' },
                { name: 'My Trips', icon: <MapPin className="w-5 h-5" />, path: '/trips', color: 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10' },
                { name: 'Budget Check', icon: <Wallet className="w-5 h-5" />, path: `/trips/${upcomingTrip.id}/budget`, color: 'bg-bg text-charcoal hover:bg-bg/70' },
              ].map((action, idx) => (
                <motion.div key={idx} variants={fadeUp}>
                  <Link to={action.path}>
                    <Card hoverLift className={`p-4 flex flex-col items-center justify-center gap-3 h-32 ${action.color} border-transparent cursor-pointer`}>
                      <div className="p-3 rounded-full bg-white shadow-sm border border-muted/30">
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium">{action.name}</span>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
          {/* Budget Snapshot */}
          <Reveal delay={0.25} direction="right">
            <h2 className="text-lg font-bold mb-4">Budget Snapshot</h2>
            <div className="grid grid-cols-1 gap-4">
              <StatCard 
                title="Total Planned Budget" 
                value={upcomingTrip.budget} 
                isCurrency={true} 
                icon={<Wallet className="w-6 h-6" />} 
                color="teal"
              />
              <StatCard 
                title="Total Spent So Far" 
                value={upcomingTrip.spent} 
                isCurrency={true} 
                icon={<Activity className="w-6 h-6" />} 
                color="coral"
                delay={0.1}
              />
            </div>
          </Reveal>

          {/* Recent Activity */}
          <Reveal delay={0.35} direction="right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-charcoal"><BellRing className="w-5 h-5 text-muted" /> Recent Activity</h2>
            </div>
            <Card delay={0.2} className="p-0 border-muted/30 bg-white">
              <div className="divide-y divide-muted/30">
                {recentActivities.map((activity, index) => (
                  <motion.div 
                    key={activity.id} 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
                    className="p-4 hover:bg-bg transition-colors flex items-start gap-3"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-teal shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{activity.action}</p>
                      <p className="text-xs text-muted mt-0.5">{activity.detail}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted font-medium">
                        <span>{activity.trip}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 bg-bg border-t border-muted/30 text-center">
                <button className="text-xs text-teal hover:text-bright font-medium transition-colors">View All Notifications</button>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
