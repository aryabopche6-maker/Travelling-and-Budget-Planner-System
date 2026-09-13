import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle2, Plus, ArrowRight, Lightbulb } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';

const hiddenCostCategories = [
  {
    id: 'transport',
    title: 'Transportation',
    items: [
      { id: 't1', name: 'Airport Transfer (Round Trip)', amount: 3500, description: 'Taxi or shuttle to and from the airport.' },
      { id: 't2', name: 'Local Transport Buffer', amount: 2000, description: 'Unexpected cab rides or subway tickets.' },
    ]
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    items: [
      { id: 'a1', name: 'City Tax / Resort Fee', amount: 1500, description: 'Often charged per night directly at the hotel.' },
      { id: 'a2', name: 'Late Checkout Fee', amount: 2000, description: 'Just in case your flight is late in the evening.' },
    ]
  },
  {
    id: 'food',
    title: 'Food & Dining',
    items: [
      { id: 'f1', name: 'Tipping Buffer', amount: 2500, description: 'Extra budget for tipping at restaurants and tours.' },
      { id: 'f2', name: 'Bottled Water & Snacks', amount: 1000, description: 'Daily convenience store runs.' },
    ]
  }
];

export default function HiddenCosts() {
  const { trip } = useTrip();
  const [addedCosts, setAddedCosts] = useState(['t1', 'a1']); // Pre-selected
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCost = (id) => {
    setAddedCosts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 1000);
  };

  const totalAdded = hiddenCostCategories
    .flatMap(c => c.items)
    .filter(item => addedCosts.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-coral/10 text-coral rounded-xl flex items-center justify-center shrink-0 border border-coral/20 shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Hidden Costs Scanner</h1>
            <p className="text-secondary mt-1">We've identified potential unexpected expenses for your {trip?.destination} trip.</p>
          </div>
        </div>
        
        <div className="bg-bg p-4 rounded-xl border border-muted/30 text-right">
          <p className="text-sm text-secondary font-medium">Potential Buffer Added</p>
          <p className="text-2xl font-bold text-coral tracking-tight">₹{totalAdded.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-teal/10 border border-teal/20 rounded-2xl p-5 flex items-start gap-4 shadow-inner">
        <Lightbulb className="w-6 h-6 text-teal shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-teal mb-1">Why is this important?</h4>
          <p className="text-sm text-secondary leading-relaxed">
            Most trips go over budget by 20% due to costs forgotten during planning. 
            We recommend adding these buffers to your budget now so you aren't surprised later.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {hiddenCostCategories.map((category, index) => (
          <Card key={category.id} delay={index * 0.1} className="p-6 bg-white border-muted/30 shadow-sm">
            <h3 className="text-xl font-bold text-charcoal mb-6 tracking-tight">{category.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map(item => {
                const isSelected = addedCosts.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleCost(item.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-coral/5 border-coral shadow-sm shadow-coral/10' 
                        : 'bg-bg border-muted/30 hover:border-coral/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-4">
                        <p className={`font-bold mb-1 ${isSelected ? 'text-coral' : 'text-charcoal'}`}>{item.name}</p>
                        <p className="text-xs text-secondary">{item.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-coral bg-coral text-white' : 'border-muted/30'
                      }`}>
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4 text-secondary" />}
                      </div>
                    </div>
                    <div className="mt-2 pt-3 border-t border-muted/50 flex justify-between items-center">
                      <span className="text-xs font-medium text-secondary uppercase tracking-wider">Estimated Cost</span>
                      <span className="font-bold text-lg text-charcoal">₹{item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-muted/30">
        <Button onClick={handleApply} isLoading={isUpdating} className="w-full md:w-auto px-10">
          Apply to Budget
        </Button>
      </div>
    </PageTransition>
  );
}
