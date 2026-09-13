import React, { useState } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Bell, 
  Map,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../common/Button';
import PageTransition from '../common/PageTransition';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const outlet = useOutlet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { name: 'My Trips', path: '/trips', icon: <Map className="w-5 h-5 shrink-0" /> },
    { name: 'Surprise Me', path: '/surprise-me', icon: <Compass className="w-5 h-5 shrink-0" /> },
    { name: 'Profile & Settings', path: '/profile', icon: <Settings className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <div className="flex h-screen bg-bg text-charcoal overflow-hidden">
      {/* Sidebar for Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? '80px' : '256px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-navy-900 border-r border-navy-800 relative z-10"
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-navy-800 border border-navy-700 text-white hover:text-white rounded-full p-1 z-20 transition-colors shadow-lg"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center px-4' : 'gap-3'} h-20 shrink-0 overflow-hidden`}>
          <Compass className="text-teal w-8 h-8 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden"
              >
                WanderPlan
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <div className={`px-4 pb-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Link to="/trips/new" title={isCollapsed ? "Create New Trip" : ""}>
            <Button className={`justify-center gap-2 bg-teal-600/20 text-teal hover:bg-bright/30 border border-teal/30 ${isCollapsed ? 'w-10 h-10 p-0 rounded-xl' : 'w-full'}`}>
              <Plus className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">New Trip</span>}
            </Button>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto overflow-x-hidden no-scrollbar relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/trips' && location.pathname.startsWith('/trips') && location.pathname !== '/trips/new' && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/surprise-me') && !location.pathname.startsWith('/profile'));
            const actuallyActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center text-xl ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl transition-colors duration-200 group relative z-10 ${
                  actuallyActive 
                    ? 'text-charcoal font-bold' 
                    : 'text-charcoal/80 hover:text-charcoal hover:bg-black/5'
                }`}
              >
                {actuallyActive && (
                  <motion.div
                    layoutId="mainNavIndicator"
                    className="absolute inset-0 bg-teal-900/40 rounded-xl shadow-[0_0_15px_rgba(24,182,165,0.15)] border border-teal/30 -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10">{item.icon}</div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-navy-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-800 shrink-0">
          <button 
            title={isCollapsed ? "Notifications" : ""}
            className={`w-full flex items-center text-xl ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} text-charcoal/80 hover:bg-black/5 rounded-lg transition-colors mb-2 group relative`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <Bell className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">Notifications</span>}
            </div>
            {!isCollapsed ? (
              <span className="bg-coral text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">3</span>
            ) : (
              <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full"></span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-navy-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Notifications (3)
              </div>
            )}
          </button>
          
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-3'} relative group`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-teal/20 text-teal flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-charcoal truncate">{user?.name}</p>
                <p className="text-base text-charcoal/70 truncate">{user?.email}</p>
              </div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-navy-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Profile
              </div>
            )}
          </div>

          <button 
            onClick={logout}
            title={isCollapsed ? "Sign Out" : ""}
            className={`w-full mt-2 flex items-center text-xl ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2'} text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium relative group`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-navy-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 border-b border-navy-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Compass className="text-teal w-6 h-6" />
          <span className="font-bold">WanderPlan</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-charcoal transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral rounded-full border-2 border-navy-900"></span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-charcoal p-1">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-bg">
        <div className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname} variant="fade" className="h-full max-w-6xl mx-auto">
              {outlet}
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-16 bg-navy-900 z-40 flex flex-col p-4 border-t border-navy-800"
          >
            <Link to="/trips/new" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full mb-6 gap-2 bg-teal-600/20 text-teal hover:bg-bright/30 border border-teal/30">
                <Plus className="w-5 h-5" /> New Trip
              </Button>
            </Link>
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium ${
                    location.pathname === item.path 
                      ? 'bg-black/5 text-charcoal' 
                      : 'text-charcoal/80 hover:text-charcoal'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
            <button 
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-4 text-red-400 mt-auto hover:bg-red-500/10 rounded-xl"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
