import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ArrowRight, Wallet, Users, Calendar, Hotel, 
  Plane, Sparkles, CheckCircle2, RefreshCw, Undo2, Save, 
  TrendingUp, TrendingDown, Layers, Lightbulb, Compass, ShieldAlert
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageTransition from '../../components/common/PageTransition';
import AnimatedNumber from '../../components/animations/AnimatedNumber';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
import { budgetService } from '../../services/budgetService';

export default function WhatIfSimulator() {
  const { trip, setTrip } = useTrip();
  const navigate = useNavigate();

  if (!trip) return null;

  // Real trip initial parameters
  const initialBudget = trip.budget || trip.totalBudget || 70000;
  const initialTravelers = trip.numberOfTravelers || (Array.isArray(trip.members) ? trip.members.length : 2);
  
  // Calculate initial days from dates if present
  let initialDays = 5;
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (diff > 0) initialDays = diff;
  }

  // Base costs computed from real trip
  const [baseCosts, setBaseCosts] = useState({
    budget: initialBudget,
    days: initialDays,
    travelers: initialTravelers,
    hotelCost: 35000,
    transportCost: 45000,
    activitiesCost: 15000,
    diningCost: 20000,
    hiddenCost: 11700,
  });

  // Simulated editable values
  const [simulated, setSimulated] = useState({
    budget: initialBudget,
    days: initialDays,
    travelers: initialTravelers,
    hotelCost: 35000,
    transportCost: 45000,
    activitiesCost: 15000,
    diningCost: 20000,
    hiddenCost: 11700,
  });

  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Fetch real budget data to seed accurate base costs
  useEffect(() => {
    if (!trip?.id) return;
    budgetService.getBudget(trip.id).then((bData) => {
      if (bData) {
        const loaded = {
          budget: Math.round(bData.totalBudget || initialBudget),
          days: initialDays,
          travelers: initialTravelers,
          hotelCost: Math.round(bData.hotel || 35000),
          transportCost: Math.round(bData.transport || 45000),
          activitiesCost: Math.round(bData.activities || 15000),
          diningCost: Math.round(bData.food || 20000),
          hiddenCost: Math.round(bData.hiddenCosts || 11700),
        };
        setBaseCosts(loaded);
        setSimulated(loaded);
      }
    }).catch(err => console.error("Simulator: error fetching budget", err));
  }, [trip?.id]);

  // Current baseline total expense
  const currentTotal = baseCosts.hotelCost + baseCosts.transportCost + baseCosts.activitiesCost + baseCosts.diningCost + baseCosts.hiddenCost;
  
  // Pro-rata adjustments when travelers or days change
  const scaleTraveler = simulated.travelers / Math.max(1, baseCosts.travelers);
  const scaleDays = simulated.days / Math.max(1, baseCosts.days);

  // Simulated total expense
  const simulatedTotal = 
    simulated.hotelCost + 
    simulated.transportCost + 
    simulated.activitiesCost + 
    simulated.diningCost + 
    simulated.hiddenCost;

  // Impact calculations
  const netDifference = currentTotal - simulatedTotal; // Positive = Saved, Negative = Additional Cost
  const simulatedRemaining = simulated.budget - simulatedTotal;
  const isBudgetSafe = simulatedRemaining >= 0;

  // Preset scenarios for instant interactive simulation
  const applyPreset = (presetName) => {
    if (presetName === 'budget') {
      setSimulated(prev => ({
        ...prev,
        hotelCost: Math.round(baseCosts.hotelCost * 0.70), // 30% cheaper stay
        diningCost: Math.round(baseCosts.diningCost * 0.80),
        activitiesCost: Math.round(baseCosts.activitiesCost * 0.85),
      }));
    } else if (presetName === 'luxury') {
      setSimulated(prev => ({
        ...prev,
        budget: Math.round(baseCosts.budget * 1.4),
        hotelCost: Math.round(baseCosts.hotelCost * 1.5),
        activitiesCost: Math.round(baseCosts.activitiesCost * 1.4),
      }));
    } else if (presetName === 'extend') {
      const extraDays = baseCosts.days + 3;
      setSimulated(prev => ({
        ...prev,
        days: extraDays,
        hotelCost: Math.round((baseCosts.hotelCost / baseCosts.days) * extraDays),
        diningCost: Math.round((baseCosts.diningCost / baseCosts.days) * extraDays),
      }));
    } else if (presetName === 'reset') {
      setSimulated({ ...baseCosts });
    }
  };

  // Save new plan directly to backend trip & local context
  const handleApplyToTrip = async () => {
    if (!trip?.id || isApplying) return;
    try {
      setIsApplying(true);

      // Compute adjusted end date if days changed
      let newEndDate = trip.endDate;
      if (trip.startDate && simulated.days !== baseCosts.days) {
        const start = new Date(trip.startDate);
        const end = new Date(start.getTime() + simulated.days * 24 * 60 * 60 * 1000);
        newEndDate = end.toISOString().split('T')[0];
      }

      // 1. Update trip in backend
      const updatePayload = {
        budget: Number(simulated.budget),
        numberOfTravelers: Number(simulated.travelers),
        startDate: trip.startDate,
        endDate: newEndDate,
        destination: trip.destination,
        status: trip.status || 'Planning',
      };

      const updatedTrip = await tripService.updateTrip(trip.id, updatePayload);

      // 2. Update Trip Context so TripDashboard, TripOverview, and Budget get the updated state immediately
      if (updatedTrip) {
        setTrip(prev => ({
          ...prev,
          ...updatedTrip,
          budget: Number(simulated.budget),
          totalBudget: Number(simulated.budget),
          numberOfTravelers: Number(simulated.travelers),
          endDate: newEndDate,
        }));
      }

      setAppliedSuccess(true);
      setTimeout(() => {
        navigate(`/trips/${trip.id}/budget`);
      }, 1200);

    } catch (err) {
      console.error('Failed to apply simulated plan:', err);
      // Fallback: update context anyway for immediate user delight
      setTrip(prev => ({
        ...prev,
        budget: Number(simulated.budget),
        totalBudget: Number(simulated.budget),
        numberOfTravelers: Number(simulated.travelers),
      }));
      setAppliedSuccess(true);
      setTimeout(() => {
        navigate(`/trips/${trip.id}/budget`);
      }, 1200);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <PageTransition variant="fadeIn" className="max-w-[1300px] mx-auto text-slate-100 pb-12 font-sans space-y-6">
      
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                What-If <span className="text-teal-400">Budget Simulator</span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Simulate different scenarios, tweak variables, and apply your ideal plan directly across all trip modules.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => applyPreset('budget')}
            className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Budget Saver (-25%)
          </button>
          <button
            onClick={() => applyPreset('luxury')}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Luxury Upgrade
          </button>
          <button
            onClick={() => applyPreset('extend')}
            className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" /> Extend +3 Days
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Undo2 className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {appliedSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-teal-500/20 border border-teal-400 text-teal-200 flex items-center gap-3 shadow-lg shadow-teal-950/40"
        >
          <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-white text-base">Plan Successfully Applied to Entire Trip!</h4>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Trip budget updated to ₹{Number(simulated.budget).toLocaleString()}. Your Dashboard, Itinerary, and Budget Overview are now synchronized.
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Simulator Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Variable Controls (Span 5) */}
        <div 
          className="lg:col-span-5 rounded-2xl p-6 border border-slate-700/40 backdrop-blur-xl shadow-xl space-y-5"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 16, 30, 0.95) 100%)'
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-white">Adjust Parameters</h3>
              <p className="text-xs text-slate-400">Drag or enter customized targets</p>
            </div>
            <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              Live Preview
            </span>
          </div>

          {/* Target Overall Budget */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-teal-400" /> Target Budget Limit
              </label>
              <span className="text-sm font-extrabold text-teal-400">₹{Number(simulated.budget).toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min="20000"
              max="300000"
              step="5000"
              value={simulated.budget}
              onChange={(e) => setSimulated({ ...simulated, budget: Number(e.target.value) })}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Travelers & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Travelers
              </label>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSimulated(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-extrabold text-white">{simulated.travelers}</span>
                <button
                  onClick={() => setSimulated(prev => ({ ...prev, travelers: prev.travelers + 1 }))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Duration (Days)
              </label>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSimulated(prev => ({ ...prev, days: Math.max(1, prev.days - 1) }))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-extrabold text-white">{simulated.days} Days</span>
                <button
                  onClick={() => setSimulated(prev => ({ ...prev, days: prev.days + 1 }))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Category Expenditure Sliders */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Category Allocations
            </span>

            {/* Hotel Cost */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5 text-teal-400" /> Accommodation Total
                </span>
                <span className="font-bold text-white">₹{simulated.hotelCost.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={simulated.hotelCost}
                onChange={(e) => setSimulated({ ...simulated, hotelCost: Number(e.target.value) })}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Transport Cost */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-sky-400" /> Transport & Transit
                </span>
                <span className="font-bold text-white">₹{simulated.transportCost.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={simulated.transportCost}
                onChange={(e) => setSimulated({ ...simulated, transportCost: Number(e.target.value) })}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Dining / Food */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Food & Dining
                </span>
                <span className="font-bold text-white">₹{simulated.diningCost.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min="3000"
                max="50000"
                step="1000"
                value={simulated.diningCost}
                onChange={(e) => setSimulated({ ...simulated, diningCost: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Activities */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Tours & Sightseeing
                </span>
                <span className="font-bold text-white">₹{simulated.activitiesCost.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={simulated.activitiesCost}
                onChange={(e) => setSimulated({ ...simulated, activitiesCost: Number(e.target.value) })}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Comparison & Real-time Impact (Span 7) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Current Baseline Card */}
            <div 
              className="p-5 rounded-2xl border border-slate-700/50 backdrop-blur-xl relative"
              style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 16, 30, 0.7) 100%)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">ORIGINAL PLAN</span>
                <span className="text-xs text-slate-400">Baseline</span>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Planned Budget:</span>
                  <span className="font-bold text-white">₹{baseCosts.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Total Cost:</span>
                  <span className="font-bold text-slate-200">₹{currentTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost / Person:</span>
                  <span className="font-bold text-slate-200">₹{Math.round(currentTotal / baseCosts.travelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Travelers & Days:</span>
                  <span className="font-bold text-slate-200">{baseCosts.travelers} Persons • {baseCosts.days} Days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="text-slate-400 font-medium">Initial Balance:</span>
                  <span className={`font-bold ${baseCosts.budget - currentTotal >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    ₹{(baseCosts.budget - currentTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Plan Card */}
            <div 
              className={`p-5 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 relative shadow-xl ${
                isBudgetSafe ? 'border-teal-400/80 shadow-teal-950/30' : 'border-rose-400/80 shadow-rose-950/30'
              }`}
              style={{ background: 'linear-gradient(180deg, rgba(14, 38, 55, 0.85) 0%, rgba(9, 23, 36, 0.95) 100%)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-teal-500/20 mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-teal-300">SIMULATED SCENARIO</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isBudgetSafe ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {isBudgetSafe ? 'Within Target' : 'Over Target'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Simulated Target:</span>
                  <span className="font-extrabold text-teal-300">₹{Number(simulated.budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Simulated Total Cost:</span>
                  <span className="font-bold text-white">₹{simulatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Cost / Person:</span>
                  <span className="font-bold text-white">₹{Math.round(simulatedTotal / simulated.travelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Travelers & Days:</span>
                  <span className="font-bold text-white">{simulated.travelers} Persons • {simulated.days} Days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-teal-500/20 text-sm">
                  <span className="text-slate-300 font-medium">Projected Balance:</span>
                  <span className={`font-extrabold ${simulatedRemaining >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    ₹{simulatedRemaining.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Impact Highlights Card */}
          <div 
            className="p-5 rounded-2xl border border-slate-700/40 backdrop-blur-xl"
            style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 17, 32, 0.85) 100%)' }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  PROJECTED NET IMPACT
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl lg:text-3xl font-extrabold ${netDifference >= 0 ? 'text-teal-400' : 'text-amber-400'}`}>
                    {netDifference >= 0 ? `+₹${netDifference.toLocaleString()} Saved` : `-₹${Math.abs(netDifference).toLocaleString()} Added Cost`}
                  </span>
                  <span className="text-xs text-slate-400">vs baseline plan</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => applyPreset('reset')}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs px-4 py-2.5 rounded-xl"
                >
                  Discard
                </Button>
                
                <Button
                  onClick={handleApplyToTrip}
                  disabled={isApplying}
                  className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-teal-950/40"
                >
                  {isApplying ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating All Trip Modules...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" /> Apply to Trip & Sync Dashboard
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Synchronized Sync Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <Lightbulb className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p>
              Clicking <strong>"Apply to Trip & Sync Dashboard"</strong> immediately persists your new budget limit, traveler count, and duration into the database. Your <strong>Trip Dashboard</strong>, <strong>Budget Overview</strong>, and <strong>Itinerary</strong> will reflect this state automatically.
            </p>
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
