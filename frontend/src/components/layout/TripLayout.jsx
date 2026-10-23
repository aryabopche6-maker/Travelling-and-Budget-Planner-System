import React, { useState, useMemo } from 'react';
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip, TripProvider } from '../../context/TripContext';
import { 
  LayoutDashboard, Users, Smile, Hotel, MapPin, 
  Wallet, Calendar, CheckSquare, ShieldAlert, BadgeIndianRupee,
  ArrowLeft, CloudSun, EyeOff, Lightbulb, Calculator, LifeBuoy,
  Menu, X
} from 'lucide-react';

function SidebarContent({ trip, isTripAdmin, navGroups, setIsMobileMenuOpen }) {
  return (
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
          {isTripAdmin ? (
            <span className="bg-teal/20 text-teal text-[10px] px-1.5 py-0.5 rounded border border-teal/20 uppercase tracking-wider font-bold">
              Admin
            </span>
          ) : (
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider font-bold">
              Member
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-3 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-[11px] font-bold text-charcoal/60 mb-1.5 px-3 tracking-wider uppercase">{group.title}</h3>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold select-none
                    transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? item.emergency 
                        ? 'text-red-500 bg-red-500/15 font-black border border-red-500/30 shadow-xs' 
                        : 'text-teal-900 bg-teal-500/25 font-black border border-teal-500/40 shadow-xs translate-x-1'
                      : item.emergency
                        ? 'text-red-400/80 hover:bg-red-500/10 hover:text-red-400'
                        : 'text-charcoal/75 hover:text-charcoal hover:bg-black/5 hover:translate-x-0.5'
                    }
                  `}
                >
                  <span className="shrink-0 transition-transform duration-200">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TripLayoutInner() {
  const { trip, isTripAdmin } = useTrip();
  const location = useLocation();
  const outlet = useOutlet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navGroups = useMemo(() => {
    if (!trip) return [];

    // Admin sees everything, member sees limited items
    if (isTripAdmin) {
      return [
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
    }

    // Member view — can see all options except Simulator and Members
    return [
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
          { name: 'Expenses', path: `/trips/${trip.id}/expenses`, icon: <BadgeIndianRupee className="w-4 h-4" /> },
        ]
      },
      {
        title: 'GROUP',
        items: [
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
  }, [trip?.id, isTripAdmin]);

  if (!trip) return <div className="h-screen bg-navy flex items-center justify-center text-white">Loading Trip...</div>;

  return (
    <div className="flex h-screen bg-bg text-charcoal overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 border-r border-navy-800 shrink-0 relative z-10 select-none">
        <SidebarContent 
          trip={trip} 
          isTripAdmin={isTripAdmin} 
          navGroups={navGroups} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
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
            <SidebarContent 
              trip={trip} 
              isTripAdmin={isTripAdmin} 
              navGroups={navGroups} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-bg">
        <div className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full max-w-7xl mx-auto"
          >
            {outlet}
          </motion.div>
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
