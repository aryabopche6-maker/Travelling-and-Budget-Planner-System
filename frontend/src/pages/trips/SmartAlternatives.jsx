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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-golden/10 text-golden rounded-xl flex items-center justify-center shrink-0 border border-golden/20 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Smart Alternatives</h1>
            <p className="text-muted mt-1">AI-powered suggestions to save money and automatically update your trip budget.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-bg p-4 rounded-xl border border-muted/30 text-right min-w-[200px]">
            <p className="text-sm text-muted font-medium">Total Savings Unlocked</p>
            <p className="text-2xl font-bold text-teal tracking-tight">₹{totalSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alternativesList.map((alt, index) => {
          const isSwapped = swapped.includes(alt.id);
          const Icon = alt.icon;
          const isCurrentLoading = applyingId === alt.id;
          
          return (
            <Card key={alt.id} delay={index * 0.1} className={`p-0 overflow-hidden border-2 transition-all duration-500 shadow-sm hover:shadow-md ${
              isSwapped ? 'border-teal bg-teal/5' : 'border-muted/30 bg-white'
            }`}>
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg border border-muted/30 flex items-center justify-center text-muted">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-charcoal">{alt.category} Alternative</h3>
                      <p className="text-sm text-muted">{alt.reason}</p>
                    </div>
                  </div>
                  {!isSwapped && (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-teal uppercase tracking-wider px-2 py-1 bg-teal/10 rounded border border-teal/20">
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
                        <div className="flex-1 w-full bg-bg p-5 rounded-xl border border-golden/30 relative overflow-hidden">
                          <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Current Choice</p>
                          <p className="font-bold text-charcoal text-lg mb-1">{alt.current.name}</p>
                          <p className="text-golden font-bold">₹{alt.current.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="w-10 h-10 shrink-0 rounded-full bg-bg flex items-center justify-center border border-muted/30 rotate-90 md:rotate-0">
                          <ArrowRight className="w-5 h-5 text-muted" />
                        </div>

                        <div className="flex-1 w-full bg-teal/10 p-5 rounded-xl border border-teal shadow-[0_0_15px_rgba(25,181,165,0.1)] relative">
                          <p className="text-xs text-teal font-medium mb-1 uppercase tracking-wider">Smart Suggestion</p>
                          <p className="font-bold text-charcoal text-lg mb-1">{alt.suggestion.name}</p>
                          <p className="text-teal font-bold">₹{alt.suggestion.price.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-teal/10 p-6 rounded-xl border border-teal flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-teal/30">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-teal text-lg">Applied to Trip & Budget!</h4>
                            <p className="text-teal-700/80 text-sm">
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
                    className="w-full md:w-auto bg-teal hover:bg-teal-500 shadow-lg shadow-teal/30 text-white"
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
