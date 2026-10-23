import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Plus, ArrowRight, Lightbulb, Wallet, Plane, Building, Utensils, HeartPulse } from 'lucide-react';
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

const categoryStyles = {
  transport: {
    icon: Plane,
    iconClass: 'bg-sky-100 text-sky-700',
    borderClass: 'border-sky-200',
    selectedClass: 'bg-sky-50 border-sky-400 shadow-sky-100',
    selectedTextClass: 'text-sky-800',
    selectedCheckClass: 'border-sky-600 bg-sky-600'
  },
  accommodation: {
    icon: Building,
    iconClass: 'bg-teal-100 text-teal-700',
    borderClass: 'border-teal-200',
    selectedClass: 'bg-teal-50 border-teal-400 shadow-teal-100',
    selectedTextClass: 'text-teal-800',
    selectedCheckClass: 'border-teal-700 bg-teal-700'
  },
  food: {
    icon: Utensils,
    iconClass: 'bg-orange-100 text-orange-700',
    borderClass: 'border-orange-200',
    selectedClass: 'bg-orange-50 border-orange-400 shadow-orange-100',
    selectedTextClass: 'text-orange-800',
    selectedCheckClass: 'border-orange-600 bg-orange-600'
  },
  contingency: {
    icon: HeartPulse,
    iconClass: 'bg-rose-100 text-rose-700',
    borderClass: 'border-rose-200',
    selectedClass: 'bg-rose-50 border-rose-400 shadow-rose-100',
    selectedTextClass: 'text-rose-800',
    selectedCheckClass: 'border-rose-600 bg-rose-600'
  }
};

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 overflow-hidden rounded-3xl border border-coral/15 bg-gradient-to-br from-[#F8F3E8] via-[#F2F7F1] to-[#EAF6F3] p-6 shadow-travel-md md:p-7"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            className="w-12 h-12 bg-coral/10 text-coral rounded-xl flex items-center justify-center shrink-0 border border-coral/20 shadow-inner"
          >
            <ShieldAlert className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Hidden Costs Scanner</h1>
            <p className="text-secondary mt-1">We've identified potential unexpected expenses for your {trip?.destination} trip.</p>
          </div>
        </div>
        
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="bg-[#FFFCF4]/90 p-4 rounded-xl border border-coral/20 text-right min-w-[200px] shadow-sm"
        >
          <p className="text-sm text-secondary font-medium">Selected Hidden Buffer</p>
          <p className="text-2xl font-bold text-coral tracking-tight">₹{totalAdded.toLocaleString()}</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        whileHover={{ y: -2 }}
        className="bg-gradient-to-r from-[#E8F4EF] to-[#F5F2E8] border border-teal/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm transition-shadow hover:shadow-travel"
      >
        <motion.div whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
          <Lightbulb className="w-6 h-6 text-teal shrink-0 mt-0.5" />
        </motion.div>
        <div className="flex-1">
          <h4 className="font-bold text-teal mb-1">Why is this important?</h4>
          <p className="text-sm text-secondary leading-relaxed">
            Most trips go over budget by 15-20% due to costs forgotten during planning. 
            Select the buffers below and click <strong>Apply to Budget</strong> to include them in your <strong>Trip Budget Overview</strong> and total calculations.
          </p>
        </div>
      </motion.div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-teal/15 border border-teal/30 text-teal p-4 rounded-xl flex items-center gap-3 font-medium"
        >
          <CheckCircle2 className="w-5 h-5 text-teal" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {hiddenCostCatalog.map((category, index) => {
          const theme = categoryStyles[category.id];
          const CategoryIcon = theme.icon;
          return (
            <Card
              key={category.id}
              delay={index * 0.1}
              hoverLift
              gradientBorder
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="p-6 !bg-[#F3F7F3] border-muted/30 shadow-sm"
            >
                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconClass}`}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal tracking-tight">{category.title}</h3>
                </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map(item => {
                const isSelected = addedCosts.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCost(item.id)}
                    aria-pressed={isSelected}
                    whileHover={{ y: -4, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className={`p-4 rounded-xl border-2 text-left transition-colors duration-200 flex flex-col justify-between ${
                      isSelected 
                        ? `${theme.selectedClass} shadow-md`
                        : `bg-[#FAF8F1] ${theme.borderClass} hover:shadow-md`
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-4">
                        <p className={`font-bold mb-1 transition-colors ${isSelected ? theme.selectedTextClass : 'text-charcoal'}`}>{item.name}</p>
                        <p className="text-xs text-secondary">{item.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? `${theme.selectedCheckClass} text-white` : 'border-muted/30 text-secondary'
                      }`}>
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="mt-2 pt-3 border-t border-muted/50 flex justify-between items-center">
                      <span className="text-xs font-medium text-secondary uppercase tracking-wider">Estimated Cost</span>
                      <span className={`font-bold text-lg ${isSelected ? theme.selectedTextClass : 'text-charcoal'}`}>₹{item.amount.toLocaleString()}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            </Card>
          );
        })}
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
