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
    badgeText: 'Transit Risk: High',
    badgeClass: 'bg-sky-500/15 text-sky-700 border-sky-300/40',
    iconGradient: 'from-sky-500 to-blue-600',
    cardBorderSelected: 'border-sky-500 ring-4 ring-sky-500/20 shadow-sky-500/25',
    cardGradientSelected: 'bg-gradient-to-br from-sky-50 via-white to-blue-50/70',
    selectedBadgeColor: 'bg-sky-600 text-white shadow-sky-500/40',
    textHighlight: 'text-sky-700',
    items: [
      { id: 't1', category: 'Transportation', name: 'Airport Transfer (Round Trip)', amount: 3500, description: 'Taxi or airport express shuttle to and from the terminal.' },
      { id: 't2', category: 'Transportation', name: 'Local Transit & Cab Buffer', amount: 2000, description: 'Surge pricing, late night rides, and local city metro tokens.' },
    ]
  },
  {
    id: 'accommodation',
    title: 'Stay & Hotel Buffers',
    subtitle: 'City taxes, baggage storage & late checkout',
    badgeText: 'Incidental Risk: Moderate',
    badgeClass: 'bg-teal-500/15 text-teal-800 border-teal-300/40',
    iconGradient: 'from-teal-500 to-emerald-600',
    cardBorderSelected: 'border-teal ring-4 ring-teal/20 shadow-teal/25',
    cardGradientSelected: 'bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60',
    selectedBadgeColor: 'bg-teal text-white shadow-teal/40',
    textHighlight: 'text-teal-800',
    items: [
      { id: 'a1', category: 'Accommodation', name: 'City Tax & Resort Service Fee', amount: 1500, description: 'Compulsory municipal tourist tax charged upon hotel arrival.' },
      { id: 'a2', category: 'Accommodation', name: 'Late Checkout & Luggage Hold', amount: 2000, description: 'Keeps you comfortable if your flight departs late in the evening.' },
    ]
  },
  {
    id: 'food',
    title: 'Dining & Refreshments',
    subtitle: 'Gratuity, hydration & impromptu tastings',
    badgeText: 'Daily Buffer',
    badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-300/40',
    iconGradient: 'from-amber-500 to-orange-600',
    cardBorderSelected: 'border-amber-500 ring-4 ring-amber-500/20 shadow-amber-500/25',
    cardGradientSelected: 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60',
    selectedBadgeColor: 'bg-amber-600 text-white shadow-amber-500/40',
    textHighlight: 'text-amber-800',
    items: [
      { id: 'f1', category: 'Food & Dining', name: 'Tipping & Gratuity Reserve', amount: 2500, description: 'Standard tipping buffer for local guides, drivers, and fine restaurants.' },
      { id: 'f2', category: 'Food & Dining', name: 'Mineral Water & Daily Snacks', amount: 1000, description: 'Convenience stores, hydration packs, and trail refreshments.' },
    ]
  },
  {
    id: 'contingency',
    title: 'Health & Emergencies',
    subtitle: 'First aid, travel insurance & peace of mind',
    badgeText: 'Safety Critical',
    badgeClass: 'bg-rose-500/15 text-rose-800 border-rose-300/40',
    iconGradient: 'from-rose-500 to-red-600',
    cardBorderSelected: 'border-rose-500 ring-4 ring-rose-500/20 shadow-rose-500/25',
    cardGradientSelected: 'bg-gradient-to-br from-rose-50/80 via-white to-red-50/60',
    selectedBadgeColor: 'bg-rose-600 text-white shadow-rose-500/40',
    textHighlight: 'text-rose-800',
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

  const [addedCosts, setAddedCosts] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingCosts, setIsLoadingCosts] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [existingCosts, setExistingCosts] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadCosts = async () => {
      setIsLoadingCosts(true);
      setLoadError('');
      try {
        if (!trip?.id) throw new Error('Trip details are unavailable.');
        const budget = await budgetService.getBudget(trip.id);
        if (!Array.isArray(budget?.hiddenCostItems)) {
          throw new Error('The current hidden costs could not be verified.');
        }
        const costs = budget.hiddenCostItems;
        const items = hiddenCostCatalog.flatMap(category => category.items);
        if (isMounted) {
          setExistingCosts(costs);
          setAddedCosts(items
            .filter(item => costs.some(cost => cost.description === item.name))
            .map(item => item.id));
        }
      } catch (error) {
        console.error('Could not fetch hidden costs', error);
        if (isMounted) {
          setLoadError(error.response?.data?.message || error.message || 'Could not load the current hidden costs.');
        }
      } finally {
        if (isMounted) setIsLoadingCosts(false);
      }
    };

    loadCosts();
    return () => {
      isMounted = false;
    };
  }, [trip?.id, reloadKey]);

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
    if (!trip?.id || isLoadingCosts || loadError) return;
    setIsUpdating(true);
    setSuccessMessage('');
    setApplyError('');

    let completedChanges = 0;
    const catalogItems = hiddenCostCatalog.flatMap(category => category.items);
    const selectedNames = new Set(selectedItems.map(item => item.name));
    const currentCatalogCosts = existingCosts.filter(cost =>
      catalogItems.some(item => item.name === cost.description)
    );
    const itemsToAdd = selectedItems.filter(item =>
      !currentCatalogCosts.some(cost => cost.description === item.name)
    );
    const costsToRemove = currentCatalogCosts.filter(cost =>
      !selectedNames.has(cost.description)
    );

    try {
      for (const item of itemsToAdd) {
        await budgetService.addHiddenCost(trip.id, {
          category: item.category,
          description: item.name,
          estimatedCost: item.amount,
          isEstimate: true
        });
        completedChanges += 1;
      }

      for (const cost of costsToRemove) {
        if (!cost.id) {
          throw new Error(`Could not safely remove “${cost.description}” because it has no ID.`);
        }
        await budgetService.deleteHiddenCost(trip.id, cost.id);
        completedChanges += 1;
      }

      setExistingCosts([
        ...existingCosts.filter(cost => !currentCatalogCosts.includes(cost)),
        ...currentCatalogCosts.filter(cost => selectedNames.has(cost.description)),
        ...itemsToAdd.map(item => ({
          description: item.name,
          category: item.category,
          estimatedCost: item.amount,
          isEstimate: true
        }))
      ]);
      setSuccessMessage('Hidden costs successfully synced with Trip Budget!');
      setTimeout(() => {
        navigate(`/trips/${trip.id}/budget`);
      }, 1000);
    } catch (err) {
      console.error('Failed to apply hidden costs:', err);
      try {
        const budget = await budgetService.getBudget(trip.id);
        if (Array.isArray(budget?.hiddenCostItems)) {
          const costs = budget.hiddenCostItems;
          const items = hiddenCostCatalog.flatMap(category => category.items);
          setExistingCosts(costs);
          setAddedCosts(items
            .filter(item => costs.some(cost => cost.description === item.name))
            .map(item => item.id));
        }
      } catch (refreshError) {
        console.error('Could not refresh hidden costs after a failed update', refreshError);
      }
      const partialUpdate = completedChanges > 0
        ? ' Some changes may already have been saved; the current selection was refreshed where possible.'
        : '';
      setApplyError(`${err.response?.data?.message || err.message || 'Could not save hidden costs.'}${partialUpdate}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* High-Contrast Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border-2 border-teal/20 bg-gradient-to-br from-[#0F766E] via-[#115E59] to-[#042F2E] p-8 sm:p-9 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 via-coral/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#F4B942] text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/20"
            >
              <ShieldAlert className="w-8 h-8 drop-shadow" />
            </motion.div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-amber-200 border border-white/20 mb-2.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Budget Armor & Safety Scanner
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display drop-shadow-sm">
                Hidden Costs & Contingency Buffers
              </h1>
              <p className="text-teal-100/90 mt-1.5 text-base max-w-xl leading-relaxed">
                Shield your <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">{trip?.destination || 'Upcoming'}</span> adventure from surprise fees, surge cabs, and missed flights.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-end justify-center rounded-2xl border border-white/25 bg-white/10 p-5 shadow-2xl backdrop-blur-xl min-w-[220px]"
          >
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-300" /> Active Safety Net
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 drop-shadow">
              ₹{totalAdded.toLocaleString()}
            </div>
            <span className="text-xs font-semibold text-teal-100/80 mt-1 bg-white/15 px-2.5 py-0.5 rounded-full">
              {selectedItems.length} of {allItems.length} buffers selected
            </span>
          </motion.div>
        </div>

        {/* Quick Toggle Controls */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={selectAll}
              disabled={isLoadingCosts || Boolean(loadError) || isUpdating}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all shadow-sm border border-white/20"
            >
              ✓ Select All Recommendations
            </button>
            <button
              onClick={clearAll}
              disabled={isLoadingCosts || Boolean(loadError) || isUpdating}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-teal-100 transition-all border border-white/10"
            >
              ✕ Clear Selection
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-teal-100">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Directly updates your Trip Budget calculations
          </div>
        </div>
      </motion.div>

      {/* Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-2xl border-2 border-teal/20 bg-gradient-to-r from-[#E6F4F1] via-[#F4F9F8] to-[#FFF9F2] p-5 shadow-sm flex items-start sm:items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-teal text-white flex items-center justify-center shrink-0 shadow-md">
          <Lightbulb className="w-6 h-6 text-amber-300" />
        </div>
        <p className="text-sm text-charcoal leading-relaxed font-medium">
          <strong className="text-teal font-bold">Pro Tip:</strong> 85% of travel groups go over budget because airport cabs, city hospitality taxes, and tips aren't budgeted upfront. Selecting these items ensures everyone chips in accurately!
        </p>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 font-semibold shadow-xl"
          >
            <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {applyError && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-800 p-4 rounded-2xl">
          {applyError}
        </div>
      )}
      {loadError && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <span>Could not load saved hidden costs: {loadError}</span>
          <Button variant="outline" onClick={() => setReloadKey(key => key + 1)}>
            Try again
          </Button>
        </div>
      )}

      {/* Catalog Cards Grid with High Contrast & Vivid Gradients */}
      <div className="grid grid-cols-1 gap-7">
        {hiddenCostCatalog.map((category, catIndex) => {
          const CategoryIcon = categoryIcons[category.id] || ShieldAlert;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.08, duration: 0.4 }}
              className="rounded-3xl border-2 border-slate-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Category Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3.5">
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-tr ${category.iconGradient} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-charcoal font-display tracking-tight">
                      {category.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${category.badgeClass}`}>
                  {category.badgeText}
                </span>
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
                      disabled={isLoadingCosts || Boolean(loadError) || isUpdating}
                      whileHover={{ y: -4, scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className={`relative overflow-hidden p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                        isSelected 
                          ? `${category.cardBorderSelected} ${category.cardGradientSelected} shadow-xl`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="pr-2">
                          <p className={`font-extrabold text-base transition-colors ${isSelected ? category.textHighlight : 'text-charcoal'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        </div>
                        <div 
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isSelected 
                              ? `${category.selectedBadgeColor} scale-110` 
                              : 'border-slate-300 text-slate-400 bg-slate-50 hover:border-slate-400'
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                        </div>
                      </div>

                      <div className={`mt-3 pt-3 border-t flex justify-between items-center ${isSelected ? 'border-black/10' : 'border-slate-100'}`}>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Recommended Buffer
                        </span>
                        <span className={`font-black text-xl ${isSelected ? category.textHighlight : 'text-slate-800'}`}>
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
        className="sticky bottom-6 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-teal/30 bg-[#0F766E] text-white p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20">
            <TrendingUp className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">Total Safety Reserve</p>
            <p className="text-2xl font-black text-white">
              ₹{totalAdded.toLocaleString()} <span className="text-xs font-medium text-teal-200">({selectedItems.length} categories active)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/trips/${trip?.id}/budget`)}
            className="flex-1 sm:flex-none !border-white/30 !text-white hover:!bg-white/10"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleApply} 
            disabled={isLoadingCosts || Boolean(loadError)}
            isLoading={isUpdating} 
            className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-amber-400 to-[#FF6B4A] hover:from-amber-300 hover:to-coral text-slate-950 shadow-xl shadow-black/20 font-extrabold rounded-xl transition-all"
          >
            Save & Sync to Budget <ArrowRight className="w-4 h-4 ml-1.5 inline" />
          </Button>
        </div>
      </motion.div>
    </PageTransition>
  );
}
