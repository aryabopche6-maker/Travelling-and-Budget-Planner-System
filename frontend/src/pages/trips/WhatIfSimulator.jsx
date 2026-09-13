import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Wallet, Users, Clock, Plane, Save, X, Lightbulb, Activity } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import { useTrip } from '../../context/TripContext';

export default function WhatIfSimulator() {
  const { trip } = useTrip();

  if (!trip) return null;

  const tripBudget = trip.budget || trip.totalBudget || 0;
  const tripSpent = trip.spent || trip.spentBudget || 0;
  const tripMemberCount = Array.isArray(trip.members) ? trip.members.length : (trip.members || 1);

  const currentPlan = {
    budget: tripBudget,
    days: 9,
    travelers: tripMemberCount,
    hotelCost: 35000,
    totalCost: tripSpent + 20000
  };

  const [newPlan, setNewPlan] = useState({ ...currentPlan, hotelCost: 20000 });
  const [isSimulating, setIsSimulating] = useState(false);

  const difference = currentPlan.totalCost - (currentPlan.totalCost - currentPlan.hotelCost + newPlan.hotelCost);
  const newTotal = currentPlan.totalCost - difference;

  const handleSimulate = (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 800);
  };

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">What-If Simulator</h1>
            <p className="text-muted mt-1">Play around with variables to see how it affects your overall budget.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card glass className="p-6 border-muted/30 shadow-sm">
            <h3 className="text-lg font-bold text-charcoal mb-6 tracking-tight">Tweak Variables</h3>
            <form onSubmit={handleSimulate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5 uppercase tracking-wider">Hotel/Stay Cost (Total)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">₹</span>
                  <Input 
                    type="number" 
                    value={newPlan.hotelCost} 
                    onChange={(e) => setNewPlan({...newPlan, hotelCost: Number(e.target.value)})}
                    className="pl-8 bg-bg border-muted/30 font-medium text-charcoal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5 uppercase tracking-wider">Travelers</label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                      type="number" 
                      value={newPlan.travelers} 
                      onChange={(e) => setNewPlan({...newPlan, travelers: Number(e.target.value)})}
                      className="pl-9 bg-bg border-muted/30 font-medium text-charcoal"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5 uppercase tracking-wider">Days</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                      type="number" 
                      value={newPlan.days} 
                      onChange={(e) => setNewPlan({...newPlan, days: Number(e.target.value)})}
                      className="pl-9 bg-bg border-muted/30 font-medium text-charcoal"
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full mt-2 bg-teal hover:bg-teal-500 shadow-lg shadow-teal/30 text-white" isLoading={isSimulating}>
                Recalculate Impact
              </Button>
            </form>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-inner">
            <Lightbulb className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200/90 leading-relaxed">
              Modifying these values will <strong>not</strong> change your actual trip settings until you click "Apply Changes".
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative flex-1">
            {/* Current Plan */}
            <Card className="p-6 md:p-8 border-muted/30 bg-bg opacity-80 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-muted font-bold mb-8 text-center tracking-widest uppercase">Current Plan</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-muted/30">
                    <span className="text-sm text-muted font-medium uppercase tracking-wider">Total Est. Cost</span>
                    <span className="font-bold text-2xl text-muted tracking-tight">₹{currentPlan.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-muted/30">
                    <span className="text-muted font-medium">Hotel Cost</span>
                    <span className="font-bold text-charcoal">₹{currentPlan.hotelCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-muted/30">
                    <span className="text-muted font-medium">Travelers</span>
                    <span className="font-bold text-charcoal">{currentPlan.travelers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted font-medium">Duration</span>
                    <span className="font-bold text-charcoal">{currentPlan.days} Days</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* VS Badge */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-sand items-center justify-center font-bold text-teal shadow-xl z-10">
              VS
            </div>

            {/* New Plan */}
            <motion.div 
              animate={isSimulating ? { scale: [1, 1.03, 1], borderColor: ['#19B5A5', '#3b82f6', '#19B5A5'] } : {}}
              transition={{ duration: 0.5 }}
              className="bg-white backdrop-blur-sm rounded-2xl border-2 border-teal p-6 md:p-8 shadow-[0_0_30px_rgba(25,181,165,0.1)] flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                <Activity className="w-32 h-32 text-teal" />
              </div>
              <div className="relative z-10">
                <h3 className="text-teal font-bold mb-8 text-center tracking-widest uppercase">Simulated Plan</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-muted/30">
                    <span className="text-sm text-muted font-medium uppercase tracking-wider">Total Est. Cost</span>
                    <span className="font-bold text-3xl text-charcoal tracking-tight">₹{newTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-muted/30">
                    <span className="text-muted font-medium">Hotel Cost</span>
                    <span className={`font-bold ${newPlan.hotelCost < currentPlan.hotelCost ? 'text-teal' : newPlan.hotelCost > currentPlan.hotelCost ? 'text-golden' : 'text-charcoal'}`}>
                      ₹{newPlan.hotelCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-muted/30">
                    <span className="text-muted font-medium">Travelers</span>
                    <span className="font-bold text-charcoal">{newPlan.travelers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted font-medium">Duration</span>
                    <span className="font-bold text-charcoal">{newPlan.days} Days</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-6 md:p-8 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-500 ${
              difference > 0 ? 'bg-teal/10 border-teal shadow-lg shadow-teal/30' : 
              difference < 0 ? 'bg-golden/10 border-golden shadow-lg shadow-warning/20' : 
              'bg-bg border-muted/30 shadow-sm'
            }`}
          >
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium mb-1 uppercase tracking-wider text-muted">Net Impact</p>
              <p className={`text-3xl font-bold tracking-tight ${
                difference > 0 ? 'text-teal' : difference < 0 ? 'text-golden' : 'text-charcoal'
              }`}>
                {difference > 0 ? `Save ₹${difference.toLocaleString()}` : difference < 0 ? `Additional ₹${Math.abs(difference).toLocaleString()}` : 'No change'}
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" className="hidden sm:flex border-muted/30 hover:bg-bg">Discard</Button>
              <Button className={`flex-1 sm:flex-none gap-2 shadow-lg text-white ${
                difference > 0 ? 'bg-teal hover:bg-bright shadow-teal/30' : 
                difference < 0 ? 'bg-golden hover:bg-amber-500 shadow-warning/30' : 
                'bg-muted hover:bg-muted'
              }`}>
                <Save className="w-4 h-4" /> Apply Changes
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
