import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, Plus, ArrowRight, Lightbulb, Wallet, 
  Plane, Building, Utensils, HeartPulse, Sparkles, TrendingUp, AlertTriangle, Check
} from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';
import { budgetService } from '../../services/budgetService';

const hiddenCostCatalog = [
  {
    id: 'transport',
    title: 'Transportation Buffers',
    subtitle: 'Transit, transfers & airport contingencies',
    gradient: 'from-sky-500/15 via-blue-500/10 to-indigo-500/5',
    accent: '#0284C7',
    items: [
      { id: 't1', category: 'Transportation', name: 'Airport Transfer (Round Trip)', amount: 3500, description: 'Taxi or airport express shuttle to and from the terminal.' },
      { id: 't2', category: 'Transportation', name: 'Local Transit & Cab Buffer', amount: 2000, description: 'Surge pricing, late night rides, and local city metro tokens.' },
    ]
  },
  {
    id: 'accommodation',
    title: 'Stay & Hotel Buffers',
    subtitle: 'City taxes, baggage storage & late checkout',
    gradient: 'from-teal-500/15 via-emerald-500/10 to-teal-500/5',
    accent: '#0D9488',
    items: [
      { id: 'a1', category: 'Accommodation', name: 'City Tax & Resort Service Fee', amount: 1500, description: 'Compulsory municipal tourist tax charged upon hotel arrival.' },
      { id: 'a2', category: 'Accommodation', name: 'Late Checkout & Luggage Hold', amount: 2000, description: 'Keeps you comfortable if your flight departs late in the evening.' },
    ]
  },
  {
    id: 'food',
    title: 'Dining & Refreshments',
    subtitle: 'Gratuity, hydration & impromptu tastings',
    gradient: 'from-amber-500/15 via-orange-500/10 to-rose-500/5',
    accent: '#EA580C',
    items: [
      { id: 'f1', category: 'Food & Dining', name: 'Tipping & Gratuity Reserve', amount: 2500, description: 'Standard tipping buffer for local guides, drivers, and fine restaurants.' },
      { id: 'f2', category: 'Food & Dining', name: 'Mineral Water & Daily Snacks', amount: 1000, description: 'Convenience stores, hydration packs, and trail refreshments.' },
    ]
  },
  {
    id: 'contingency',
    title: 'Health & Emergencies',
    subtitle: 'First aid, travel insurance & peace of mind',
    gradient: 'from-rose-500/15 via-pink-500/10 to-red-500/5',
    accent: '#E11D48',
    items: [
      { id: 'c1', category: 'Emergency', name: 'First Aid & Medical Buffer', amount: 1500, description: 'Altitude sickness meds, emergency pharmacy runs, and hydration salts.' },
      { id: 'c2', category: 'Emergency', name: 'Universal Contingency Reserve', amount: 3500, description: 'Flexible safety cushion for unpredicted events, itinerary modifications.' }
    ]
  }
];

const categoryIcons = {
  transport: Plane,
  accommodation: Building,
  food: Utensils,
  contingency: HeartPulse
};

export default function HiddenCosts() {
  const { trip } = useTrip();
  const navigate = useNavigate();

  const [addedCosts, setAddedCosts] = useState(['t1', 'a1']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [existingCosts, setExistingCosts] = useState([]);

  useEffect(() => {
    if (!trip?.id) return;
    budgetService.getBudget(trip.id).then((res) => {
      if (res && res.hiddenCostItems) {
        setExistingCosts(res.hiddenCostItems);
        const matched = [];
        hiddenCostCatalog.flatMap(c => c.items).forEach(item => {
          if (res.hiddenCostItems.some(h => h.description === item.name)) {
            matched.push(item.id);
          }
        });
        if (matched.length > 0) {
          setAddedCosts(matched);
        }
      }
    }).catch(err => console.error("Could not fetch hidden costs", err));
  }, [trip?.id]);

  const toggleCost = (id) => {
    setAddedCosts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = hiddenCostCatalog.flatMap(c => c.items.map(i => i.id));
    setAddedCosts(allIds);
  };

  const clearAll = () => {
    setAddedCosts([]);
  };

  const allItems = hiddenCostCatalog.flatMap(c => c.items);
  const selectedItems = allItems.filter(item => addedCosts.includes(item.id));
  const totalAdded = selectedItems.reduce((sum, item) => sum + item.amount, 0);

  const handleApply = async () => {
    if (!trip?.id) return;
    setIsUpdating(true);
    setSuccessMessage('');

    try {
      for (const cost of existingCosts) {
        if (cost.id) {
          await budgetService.deleteHiddenCost(trip.id, cost.id).catch(() => {});
        }
      }

      for (const item of selectedItems) {
        await budgetService.addHiddenCost(trip.id, {
          category: item.category,
          description: item.name,
          estimatedCost: item.amount,
          isEstimate: true
        });
      }

      setSuccessMessage('Hidden costs successfully synced with Trip Budget!');
      setTimeout(() => {
        navigate(`/trips/${trip.id}/budget`);
      }, 1000);
    } catch (err) {
      console.error('Failed to apply hidden costs:', err);
      navigate(`/trips/${trip.id}/budget`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Cinematic Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-[#F0FDF4]/90 to-[#E0F2FE]/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-gradient-to-br from-teal/20 via-sky-400/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 h-40 w-40 rounded-full bg-coral/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-coral to-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-coral/30"
            >
              <ShieldAlert className="w-7 h-7" />
            </motion.div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-coral/15 text-coral mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Smart Protection Scanner
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-charcoal font-display">
                Hidden Costs & Safety Buffers
              </h1>
              <p className="text-muted mt-1.5 text-base max-w-xl">
                Real-time safety cushion for your <span className="font-semibold text-charcoal">{trip?.destination || 'Upcoming'}</span> trip. Prevent unexpected holiday surprises.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-end justify-center rounded-2xl border border-teal/20 bg-white/90 p-5 shadow-xl backdrop-blur-md min-w-[220px]"
          >
            <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-teal" /> Protected Buffer
            </span>
            <div className="text-3xl font-black tracking-tight text-teal mt-1">
              ₹{totalAdded.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-muted mt-0.5">
              {selectedItems.length} of {allItems.length} buffers active
            </span>
          </motion.div>
        </div>

        {/* Quick Toggle Controls */}
        <div className="relative z-10 mt-6 pt-6 border-t border-charcoal/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal/10 hover:bg-teal/20 text-teal transition-all"
            >
              Select All Recommendations
            </button>
            <button
              onClick={clearAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-charcoal/5 hover:bg-charcoal/10 text-muted transition-all"
            >
              Clear Selection
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
            Auto-calculated into your Budget Overview
          </div>
        </div>
      </motion.div>

      {/* Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-2xl border border-teal/25 bg-gradient-to-r from-teal/10 via-emerald-500/5 to-sky-500/10 p-5 shadow-md flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-teal/20 text-teal flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <p className="text-sm text-charcoal/80 leading-relaxed">
          <strong className="text-charcoal font-semibold">Smart Travel Rule:</strong> Trips usually exceed basic estimates by 15-20% due to incidental local transport, resort taxes, and emergency needs. Adding these buffers ensures your group never runs out of cash!
        </p>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 font-semibold shadow-lg backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {hiddenCostCatalog.map((category, catIndex) => {
          const CategoryIcon = categoryIcons[category.id] || ShieldAlert;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.08, duration: 0.4 }}
              className="rounded-3xl border border-charcoal/10 bg-white/80 backdrop-blur-md p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105"
                    style={{ background: category.accent }}
                  >
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal font-display tracking-tight">
                      {category.title}
                    </h3>
                    <p className="text-xs text-muted font-medium">
                      {category.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items in Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map(item => {
                  const isSelected = addedCosts.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCost(item.id)}
                      whileHover={{ y: -4, scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className={`relative overflow-hidden p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected 
                          ? 'border-teal bg-gradient-to-br from-teal/10 via-emerald-500/5 to-white shadow-lg shadow-teal/15 ring-2 ring-teal/20'
                          : 'border-charcoal/10 bg-gradient-to-br from-white to-slate-50/70 hover:border-teal/40 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="pr-2">
                          <p className={`font-bold text-base transition-colors ${isSelected ? 'text-teal' : 'text-charcoal'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <div 
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isSelected 
                              ? 'border-teal bg-teal text-white shadow-md shadow-teal/30 scale-105' 
                              : 'border-muted/30 text-muted hover:border-teal hover:text-teal'
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-charcoal/10 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                          Recommended Buffer
                        </span>
                        <span className={`font-black text-lg ${isSelected ? 'text-teal' : 'text-charcoal'}`}>
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-6 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal/15 text-teal flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Buffer Total</p>
            <p className="text-xl font-black text-charcoal">
              ₹{totalAdded.toLocaleString()} <span className="text-xs font-normal text-muted">({selectedItems.length} categories)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/trips/${trip?.id}/budget`)}
            className="flex-1 sm:flex-none border-charcoal/20 hover:bg-charcoal/5"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleApply} 
            isLoading={isUpdating} 
            className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-teal to-emerald-600 hover:from-bright hover:to-teal text-white shadow-xl shadow-teal/30 font-bold rounded-xl transition-all"
          >
            Save & Sync to Budget <ArrowRight className="w-4 h-4 ml-1.5 inline" />
          </Button>
        </div>
      </motion.div>
    </PageTransition>
  );
}
