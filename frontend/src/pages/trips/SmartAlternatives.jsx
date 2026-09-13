import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Building, Map, Plane, CheckCircle2 } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const alternatives = [
  {
    id: 'alt1',
    category: 'Hotel',
    icon: Building,
    current: { name: 'Oceanview Resort', price: 35000 },
    suggestion: { name: 'Sunset Sands Boutique', price: 26500 },
    savings: 8500,
    reason: 'Similar 4-star rating, located 10 mins away, but 25% cheaper for your specific dates.'
  },
  {
    id: 'alt2',
    category: 'Activity',
    icon: Map,
    current: { name: 'Private Island Tour', price: 12000 },
    suggestion: { name: 'Group Island Hopping', price: 4500 },
    savings: 7500,
    reason: 'Shared boat tour visits the exact same islands and includes a BBQ lunch.'
  },
  {
    id: 'alt3',
    category: 'Flight',
    icon: Plane,
    current: { name: 'Direct Flight (Morning)', price: 45000 },
    suggestion: { name: '1-Stop Flight (Afternoon)', price: 32000 },
    savings: 13000,
    reason: 'Adding a 2-hour layover in Kuala Lumpur saves you ₹13,000 per person.'
  }
];

export default function SmartAlternatives() {
  const [swapped, setSwapped] = useState([]);

  const handleSwap = (id) => {
    setSwapped(prev => [...prev, id]);
  };

  const totalSavings = alternatives
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
            <p className="text-muted mt-1">AI-powered suggestions to save money without compromising your experience.</p>
          </div>
        </div>
        
        <div className="bg-bg p-4 rounded-xl border border-muted/30 text-right">
          <p className="text-sm text-muted font-medium">Total Savings Unlocked</p>
          <p className="text-2xl font-bold text-teal tracking-tight">₹{totalSavings.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alternatives.map((alt, index) => {
          const isSwapped = swapped.includes(alt.id);
          const Icon = alt.icon;
          
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
                        className="bg-teal/10 p-6 rounded-xl border border-teal flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-teal/30">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-teal text-lg">Successfully Swapped!</h4>
                          <p className="text-teal-700/80 text-sm">
                            You've updated to {alt.suggestion.name} and saved ₹{alt.savings.toLocaleString()} on your budget.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {!isSwapped && (
                <div className="bg-bg/50 px-6 py-4 md:px-8 flex justify-end border-t border-muted/30">
                  <Button 
                    onClick={() => handleSwap(alt.id)}
                    className="w-full md:w-auto bg-teal hover:bg-teal-500 shadow-lg shadow-teal/30 text-white"
                  >
                    Swap & Save
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
}
