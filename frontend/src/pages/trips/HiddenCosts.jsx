import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle2, Plus, ArrowRight, Lightbulb, Check, Wallet } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';
import { budgetService } from '../../services/budgetService';

const hiddenCostCatalog = [
  {
    id: 'transport',
    title: 'Transportation',
    items: [
      { id: 't1', category: 'Transportation', name: 'Airport Transfer (Round Trip)', amount: 3500, description: 'Taxi or shuttle to and from the airport.' },
      { id: 't2', category: 'Transportation', name: 'Local Transport Buffer', amount: 2000, description: 'Unexpected cab rides or subway tickets.' },
    ]
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    items: [
      { id: 'a1', category: 'Accommodation', name: 'City Tax / Resort Fee', amount: 1500, description: 'Often charged per night directly at the hotel.' },
      { id: 'a2', category: 'Accommodation', name: 'Late Checkout Fee', amount: 2000, description: 'Just in case your flight is late in the evening.' },
    ]
  },
  {
    id: 'food',
    title: 'Food & Dining',
    items: [
      { id: 'f1', category: 'Food & Dining', name: 'Tipping Buffer', amount: 2500, description: 'Extra budget for tipping at restaurants and tours.' },
      { id: 'f2', category: 'Food & Dining', name: 'Bottled Water & Snacks', amount: 1000, description: 'Daily convenience store runs.' },
    ]
  },
  {
    id: 'contingency',
    title: 'Emergency & Contingency',
    items: [
      { id: 'c1', category: 'Emergency', name: 'Medical & First Aid Buffer', amount: 1500, description: 'Emergency medicines and pharmacy visits.' },
      { id: 'c2', category: 'Emergency', name: 'General Contingency Reserve', amount: 3500, description: 'Flexible safety net for unplanned events.' }
    ]
  }
];

export default function HiddenCosts() {
  const { trip } = useTrip();
  const navigate = useNavigate();

  const [addedCosts, setAddedCosts] = useState(['t1', 'a1']); // Local selection
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [existingCosts, setExistingCosts] = useState([]);

  // Load existing hidden costs from backend
  useEffect(() => {
    if (!trip?.id) return;
    budgetService.getBudget(trip.id).then((res) => {
      if (res && res.hiddenCostItems) {
        setExistingCosts(res.hiddenCostItems);
        // Pre-select items matching existing items if any
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

  const allItems = hiddenCostCatalog.flatMap(c => c.items);
  const selectedItems = allItems.filter(item => addedCosts.includes(item.id));
  const totalAdded = selectedItems.reduce((sum, item) => sum + item.amount, 0);

  const handleApply = async () => {
    if (!trip?.id) return;
    setIsUpdating(true);
    setSuccessMessage('');

    try {
      // 1. Delete previous saved hidden costs to cleanly replace with current selection
      for (const cost of existingCosts) {
        if (cost.id) {
          await budgetService.deleteHiddenCost(trip.id, cost.id).catch(() => {});
        }
      }

      // 2. Add each selected item to the backend budget
      for (const item of selectedItems) {
        await budgetService.addHiddenCost(trip.id, {
          category: item.category,
          description: item.name,
          estimatedCost: item.amount,
          isEstimate: true
        });
      }

      setSuccessMessage('Hidden costs applied! Redirecting to Budget Overview...');
      setTimeout(() => {
        navigate(`/trips/${trip.id}/budget`);
      }, 1000);
    } catch (err) {
      console.error('Failed to apply hidden costs:', err);
      // Fallback redirect anyway
      navigate(`/trips/${trip.id}/budget`);
    } finally {
      setIsUpdating(false);
    }
  };

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
        
        <div className="bg-bg p-4 rounded-xl border border-muted/30 text-right min-w-[200px]">
          <p className="text-sm text-secondary font-medium">Selected Hidden Buffer</p>
          <p className="text-2xl font-bold text-coral tracking-tight">₹{totalAdded.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-teal/10 border border-teal/20 rounded-2xl p-5 flex items-start gap-4 shadow-inner">
        <Lightbulb className="w-6 h-6 text-teal shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-teal mb-1">Why is this important?</h4>
          <p className="text-sm text-secondary leading-relaxed">
            Most trips go over budget by 15-20% due to costs forgotten during planning. 
            Select the buffers below and click <strong>Apply to Budget</strong> to include them in your <strong>Trip Budget Overview</strong> and total calculations.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-teal/15 border border-teal/30 text-teal p-4 rounded-xl flex items-center gap-3 font-medium">
          <CheckCircle2 className="w-5 h-5 text-teal" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {hiddenCostCatalog.map((category, index) => (
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-muted/30">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/trips/${trip.id}/budget`)}
          className="w-full sm:w-auto"
        >
          Cancel & Return to Overview
        </Button>

        <Button 
          onClick={handleApply} 
          isLoading={isUpdating} 
          className="w-full sm:w-auto px-10 bg-teal hover:bg-teal-600 text-white shadow-lg shadow-teal/20"
        >
          Apply to Budget ({selectedItems.length} Selected • ₹{totalAdded.toLocaleString()})
        </Button>
      </div>
    </PageTransition>
  );
}
