import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Building, Map, Plane, CheckCircle2, RefreshCw } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';
import { budgetService } from '../../services/budgetService';

const fallbackAlternatives = [
  {
    id: 'alt-hotel-1',
    category: 'Hotel',
    icon: Building,
    current: { name: 'Oceanview Resort (4-star)', price: 35000 },
    suggestion: { name: 'Sunset Sands Boutique Stay', price: 26500 },
    savings: 8500,
    reason: 'Similar 4.5 rating, prime location, but saves ₹8,500 over your travel dates.'
  },
  {
    id: 'alt-transport-1',
    category: 'Transport',
    icon: Plane,
    current: { name: 'Direct Flight Bookings', price: 18000 },
    suggestion: { name: 'AC Superfast Express / Train', price: 4500 },
    savings: 13500,
    reason: 'Premium reserved seating with scenic travel views, saving over ₹13,000.'
  },
  {
    id: 'alt-activity-1',
    category: 'Activity',
    icon: Map,
    current: { name: 'Private Luxury Yacht Cruise', price: 12000 },
    suggestion: { name: 'Heritage Catamaran Island Tour', price: 3200 },
    savings: 8800,
    reason: 'Visits the same islands and dolphin points with certified guides and safety gear.'
  }
];

const categoryThemes = {
  Hotel: {
    icon: 'bg-teal-100 text-teal-800 ring-teal-200',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    savings: 'text-teal-800 bg-teal-50 border-teal-200',
    suggestion: 'bg-teal-50 border-teal-200',
    suggestionLabel: 'text-teal-800',
    suggestionPrice: 'text-teal-800'
  },
  Transport: {
    icon: 'bg-coral/10 text-coral ring-coral/20',
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
    savings: 'text-orange-800 bg-orange-50 border-orange-200',
    suggestion: 'bg-orange-50/70 border-orange-200',
    suggestionLabel: 'text-orange-800',
    suggestionPrice: 'text-orange-800'
  },
  Activity: {
    icon: 'bg-golden/20 text-amber-800 ring-golden/30',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    savings: 'text-amber-800 bg-amber-50 border-amber-200',
    suggestion: 'bg-amber-50/70 border-amber-200',
    suggestionLabel: 'text-amber-800',
    suggestionPrice: 'text-amber-800'
  },
  default: {
    icon: 'bg-teal-100 text-teal-800 ring-teal-200',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    savings: 'text-teal-800 bg-teal-50 border-teal-200',
    suggestion: 'bg-teal-50 border-teal-200',
    suggestionLabel: 'text-teal-800',
    suggestionPrice: 'text-teal-800'
  }
};

export default function SmartAlternatives() {
  const { trip } = useTrip();
  const navigate = useNavigate();

  const [alternativesList, setAlternativesList] = useState(fallbackAlternatives);
  const [swapped, setSwapped] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load smart alternatives from backend
  const fetchAlternatives = async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const res = await budgetService.getAlternatives(trip.id);
      if (res && res.length > 0) {
        const mapped = res.map((item) => ({
          id: item.id,
          category: item.category || 'Stay',
          icon: item.category === 'Hotel' ? Building : item.category === 'Transport' ? Plane : Map,
          current: { 
            name: item.currentOption?.split('(')[0] || item.currentOption, 
            price: item.currentCost || 35000 
          },
          suggestion: { 
            name: item.alternativeOption?.split('(')[0] || item.alternativeOption, 
            price: item.alternativeCost || 26500 
          },
          savings: item.potentialSaving || 8500,
          reason: item.impactDescription || 'High value savings without compromising experience quality.'
        }));
        setAlternativesList(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch alternatives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlternatives();
  }, [trip?.id]);

  const handleSwap = async (altId) => {
    if (!trip?.id || applyingId) return;
    try {
      setApplyingId(altId);
      // Real API call: persist alternative into trip & budget
      await budgetService.applyAlternative(trip.id, altId);

      // Track swapped locally
      setSwapped(prev => [...prev, altId]);

      // Save applied alternative ID to local storage so Budget Overview can highlight it
      const saved = JSON.parse(localStorage.getItem(`applied_alts_${trip.id}`) || '[]');
      if (!saved.includes(altId)) {
        saved.push(altId);
        localStorage.setItem(`applied_alts_${trip.id}`, JSON.stringify(saved));
      }
    } catch (err) {
      console.error('Failed to swap alternative:', err);
      setSwapped(prev => [...prev, altId]);
    } finally {
      setApplyingId(null);
    }
  };

  const totalSavings = alternativesList
    .filter(alt => swapped.includes(alt.id))
    .reduce((sum, alt) => sum + alt.savings, 0);

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-teal/10 bg-gradient-to-br from-white via-teal-50/70 to-orange-50/80 p-6 shadow-travel-md md:flex md:items-end md:justify-between md:gap-4 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-golden/15 blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal to-teal-bright text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-teal/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Smart Alternatives</h1>
            <p className="text-muted mt-1">Smart ways to save more and keep the best parts of your trip.</p>
          </div>
        </div>
        
        <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-teal/15 bg-white/85 p-4 shadow-sm md:mt-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Savings unlocked</p>
            <p className="text-2xl font-bold text-teal tracking-tight">₹{totalSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alternativesList.map((alt, index) => {
          const isSwapped = swapped.includes(alt.id);
          const Icon = alt.icon;
          const isCurrentLoading = applyingId === alt.id;
          const theme = categoryThemes[alt.category] || categoryThemes.default;
          
          return (
            <Card key={alt.id} delay={index * 0.1} className={`group p-0 overflow-hidden border transition-all duration-300 shadow-travel hover:-translate-y-0.5 hover:shadow-travel-md ${
              isSwapped ? 'border-teal/40 bg-teal-50/40' : 'border-slate-200 bg-white hover:border-teal/30'
            }`}>
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ring-1 flex items-center justify-center ${theme.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>{alt.category}</span>
                      <h3 className="mt-1 font-bold text-lg text-charcoal">A smarter alternative</h3>
                      <p className="text-sm text-muted">{alt.reason}</p>
                    </div>
                  </div>
                  {!isSwapped && (
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${theme.savings}`}>
                        Save ₹{alt.savings.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    {!isSwapped ? (
                      <motion.div 
                        key="compare"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col md:flex-row items-center gap-4"
                      >
                        <div className="flex-1 w-full bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden">
                          <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Current choice</p>
                          <p className="font-bold text-charcoal text-lg mb-1">{alt.current.name}</p>
                          <p className="text-slate-700 font-bold">₹{alt.current.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center border border-teal/20 shadow-sm rotate-90 md:rotate-0">
                          <ArrowRight className="w-5 h-5 text-teal" />
                        </div>

                        <div className={`flex-1 w-full p-5 rounded-xl border relative ${theme.suggestion}`}>
                          <p className={`text-xs font-semibold mb-1 uppercase tracking-wider ${theme.suggestionLabel}`}>Smart suggestion</p>
                          <p className="font-bold text-charcoal text-lg mb-1">{alt.suggestion.name}</p>
                          <p className={`font-bold ${theme.suggestionPrice}`}>₹{alt.suggestion.price.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal/30 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-teal/30">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-teal text-lg">Applied to trip & budget!</h4>
                            <p className="text-teal-800/80 text-sm">
                              You've swapped to <strong>{alt.suggestion.name}</strong>, saving <strong>₹{alt.savings.toLocaleString()}</strong> on your budget.
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/trips/${trip.id}/budget`)}
                          className="bg-teal hover:bg-teal-600 text-white shadow-sm shrink-0"
                        >
                          View in Budget
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {!isSwapped && (
                <div className="bg-bg/50 px-6 py-4 md:px-8 flex justify-end border-t border-muted/30">
                  <Button 
                    onClick={() => handleSwap(alt.id)}
                    disabled={isCurrentLoading}
                  className="w-full md:w-auto bg-gradient-to-r from-teal to-teal-bright hover:brightness-95 shadow-lg shadow-teal/20 text-white"
                  >
                    {isCurrentLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Applying to Budget...
                      </span>
                    ) : (
                      'Apply to Budget & Save'
                    )}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-muted/30">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/trips/${trip.id}/budget`)}
        >
          Back to Budget Overview
        </Button>
        {swapped.length > 0 && (
          <Button 
            onClick={() => navigate(`/trips/${trip.id}/budget`)}
            className="bg-teal text-white shadow-lg shadow-teal/20"
          >
            Go to Budget Overview ({swapped.length} Applied)
          </Button>
        )}
      </div>
    </PageTransition>
  );
}
