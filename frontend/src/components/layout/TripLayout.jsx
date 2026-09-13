import React, { useState } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip, TripProvider } from '../../context/TripContext';
import { 
  LayoutDashboard, Users, Smile, Hotel, MapPin, 
  Wallet, Calendar, CheckSquare, ShieldAlert, BadgeIndianRupee,
  ArrowLeft, CloudSun, EyeOff, Lightbulb, Calculator, LifeBuoy,
  Menu, X
} from 'lucide-react';

function TripLayoutInner() {
  const { trip, isTripAdmin } = useTrip(); // Assuming we use isTripAdmin per instructions
  const location = useLocation();
  const outlet = useOutlet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If trip context hasn't loaded yet (though provider should handle this)
  if (!trip) return <div className="h-screen bg-navy flex items-center justify-center text-white">Loading Trip...</div>;

  const navGroups = [
    {
      title: 'TRIP',
      items: [
        { name: 'Overview', path: `/trips/${trip.id}/overview`, icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      title: 'PLAN',
      items: [
        { name: 'Mood & Preferences', path: `/trips/${trip.id}/mood`, icon: <Smile className="w-4 h-4" /> },
        { name: 'Places', path: `/trips/${trip.id}/places`, icon: <MapPin className="w-4 h-4" /> },
        { name: 'Hotels', path: `/trips/${trip.id}/hotels`, icon: <Hotel className="w-4 h-4" /> },
        { name: 'Weather', path: `/trips/${trip.id}/weather`, icon: <CloudSun className="w-4 h-4" /> },
        { name: 'Itinerary', path: `/trips/${trip.id}/itinerary`, icon: <Calendar className="w-4 h-4" /> }
      ]
    },
    {
      title: 'MONEY',
      items: [
        { name: 'Budget', path: `/trips/${trip.id}/budget`, icon: <Wallet className="w-4 h-4" /> },
        { name: 'Hidden Costs', path: `/trips/${trip.id}/hidden-costs`, icon: <EyeOff className="w-4 h-4" /> },
        { name: 'Smart Alternatives', path: `/trips/${trip.id}/alternatives`, icon: <Lightbulb className="w-4 h-4" /> },
        { name: 'What-If Simulator', path: `/trips/${trip.id}/simulator`, icon: <Calculator className="w-4 h-4" /> },
        { name: 'Expenses', path: `/trips/${trip.id}/expenses`, icon: <BadgeIndianRupee className="w-4 h-4" /> },
        { name: 'Budget Rescue', path: `/trips/${trip.id}/budget-rescue`, icon: <LifeBuoy className="w-4 h-4" /> }
      ]
    },
    {
      title: 'GROUP',
      items: [
        { name: 'Members', path: `/trips/${trip.id}/members`, icon: <Users className="w-4 h-4" /> },
        { name: 'Voting', path: `/trips/${trip.id}/voting`, icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },
    {
      title: 'SAFETY',
      items: [
        { name: 'SOS', path: `/trips/${trip.id}/sos`, icon: <ShieldAlert className="w-4 h-4" />, emergency: true }
      ]
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-navy-800 shrink-0">
        <Link 
          to="/trips" 
          className="inline-flex items-center gap-2 text-sm text-charcoal/80 hover:text-charcoal transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          My Trips
        </Link>
        <h2 className="text-xl font-bold text-charcoal truncate" title={trip.destination}>
          {trip.destination}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-charcoal/70">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
          {isTripAdmin && (
            <span className="bg-teal/20 text-teal text-[10px] px-1.5 py-0.5 rounded border border-teal/20 uppercase tracking-wider font-bold">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-sm font-bold text-charcoal mb-2 px-3 tracking-wider">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-colors ${
                      isActive 
                        ? item.emergency 
                          ? 'text-red-400' 
                          : 'text-charcoal font-bold'
                        : item.emergency
                          ? 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                          : 'text-charcoal/80 hover:text-charcoal hover:bg-black/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tripNavIndicator"
                        className={`absolute inset-0 rounded-lg -z-10 ${
                          item.emergency 
                            ? 'bg-red-500/20 border border-red-500/30' 
                            : 'bg-teal-900/40 border border-teal/30 shadow-[0_0_15px_rgba(24,182,165,0.15)]'
                        }`}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.icon}</span>
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-bg text-charcoal overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 border-r border-navy-800 shrink-0 relative z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 border-b border-navy-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 truncate pr-4">
          <Link to="/trips" className="text-charcoal/80 hover:text-charcoal mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-charcoal truncate">{trip.destination}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-charcoal p-1 shrink-0">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-16 bg-navy-900 z-40 flex flex-col border-t border-navy-800"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-bg">
        <div className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-7xl mx-auto"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function TripLayout() {
  return (
    <TripProvider>
      <TripLayoutInner />
    </TripProvider>
  );
}
