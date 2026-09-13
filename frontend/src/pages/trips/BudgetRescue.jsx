import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';

const rescueOptions = [
  {
    id: 'ro1',
    title: 'Downgrade Hotel',
    description: 'Switch from Oceanview Resort (4-star) to Sunset Sands (3-star).',
    savings: 8500,
    impact: 'Moderate: You will lose the pool and spa, but it is still close to the beach.'
  },
  {
    id: 'ro2',
    title: 'Remove Premium Activity',
    description: 'Cancel the Private Island Tour.',
    savings: 12000,
    impact: 'High: Major itinerary change.'
  },
  {
    id: 'ro3',
    title: 'Adjust Food Budget',
    description: 'Switch from "Premium" to "Moderate" dining style.',
    savings: 5000,
    impact: 'Low: Swap 2 fine dining meals for local street food.'
  }
];

export default function BudgetRescue() {
  const { trip } = useTrip();
  const overageAmount = 15000; // Simulated overage
  
  const [selectedRescues, setSelectedRescues] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [isRescued, setIsRescued] = useState(false);

  const totalSaved = selectedRescues.reduce((sum, id) => {
    const option = rescueOptions.find(o => o.id === id);
    return sum + (option ? option.savings : 0);
  }, 0);

  const remainingOverage = Math.max(0, overageAmount - totalSaved);
  const isBudgetFixed = remainingOverage === 0;

  const toggleRescue = (id) => {
    setSelectedRescues(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsRescued(true);
    }, 1500);
  };

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-golden/10 text-golden rounded-xl flex items-center justify-center shrink-0 border border-golden/20 shadow-inner">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Budget Rescue</h1>
            <p className="text-muted mt-1">You are currently over budget. Select options to bring it back in line.</p>
          </div>
        </div>
        
        <div className="bg-bg p-4 rounded-xl border border-muted/30 text-right min-w-[200px]">
          <p className="text-sm text-muted font-medium">Remaining Overage</p>
          <p className={`text-2xl font-bold tracking-tight ${isBudgetFixed ? 'text-teal' : 'text-golden'}`}>
            {isBudgetFixed ? '₹0 (Budget Safe!)' : `₹${remainingOverage.toLocaleString()}`}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isRescued ? (
          <motion.div key="rescue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 gap-6">
            <div className="bg-golden/10 border border-golden/30 rounded-2xl p-5 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-golden shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-golden mb-1">Action Required</h4>
                <p className="text-sm text-golden-700 leading-relaxed">
                  Your current planned expenses exceed your set budget of ₹{(trip.budget || trip.totalBudget || 0).toLocaleString()} by <strong>₹{overageAmount.toLocaleString()}</strong>. 
                  Select from the AI-generated rescue options below to fix your budget without cancelling the trip.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {rescueOptions.map((option, index) => {
                const isSelected = selectedRescues.includes(option.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={option.id}
                  >
                    <Card 
                      className={`p-6 border-2 cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'border-teal bg-teal/5 shadow-lg shadow-teal/30' 
                          : 'border-muted/30 bg-white hover:border-teal/50 shadow-sm'
                      }`}
                      onClick={() => toggleRescue(option.id)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-bold text-lg ${isSelected ? 'text-teal' : 'text-charcoal'}`}>{option.title}</h3>
                            <span className="text-xs font-bold bg-bg px-2 py-1 rounded text-muted border border-muted/30">
                              {option.impact.split(':')[0]} Impact
                            </span>
                          </div>
                          <p className="text-muted text-sm mb-3">{option.description}</p>
                          <p className="text-xs text-muted font-medium">Impact Detail: {option.impact.split(':')[1]}</p>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                          <span className="text-xl font-bold text-teal tracking-tight">Save ₹{option.savings.toLocaleString()}</span>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'border-teal bg-teal text-white' : 'border-grayblue-400'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-end pt-6 border-t border-muted/30">
              <Button 
                onClick={handleApply} 
                isLoading={isApplying} 
                disabled={selectedRescues.length === 0}
                className={`w-full md:w-auto px-10 shadow-lg text-base text-white ${isBudgetFixed ? 'bg-teal shadow-teal/30' : 'bg-golden hover:bg-amber-500 shadow-warning/30'}`}
              >
                {isBudgetFixed ? 'Save Budget Changes' : 'Apply Partial Fix'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-teal/10 border border-teal rounded-2xl p-8 flex flex-col items-center justify-center text-center py-16"
          >
            <div className="w-20 h-20 bg-teal rounded-full flex items-center justify-center mb-6 shadow-xl shadow-teal/30">
              <LifeBuoy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-charcoal mb-4 tracking-tight">Budget Rescued!</h3>
            <p className="text-teal-700/80 max-w-lg mx-auto mb-8 text-lg">
              You successfully applied {selectedRescues.length} rescue operations, saving a total of ₹{totalSaved.toLocaleString()}. 
              Your itinerary and budget have been automatically updated.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="border-teal text-teal hover:bg-teal hover:text-white transition-colors" onClick={() => setIsRescued(false)}>
                Undo Changes
              </Button>
              <Button className="bg-teal text-white shadow-lg shadow-teal/30">
                View Updated Budget
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
