import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import Button from '../../common/Button';

export default function BudgetRescueWarning({ predictedOverage, onRescue }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 text-red-500/10 rotate-12">
        <AlertTriangle className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-red-400">Budget Rescue Alert</h3>
        </div>
        
        <p className="text-red-200/80 mb-6 max-w-xl">
          Warning: Based on your recent expenses and remaining itinerary, you are predicted to exceed your budget by <span className="font-bold text-white">₹{predictedOverage.toLocaleString()}</span>.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={onRescue} className="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 gap-2">
            <TrendingDown className="w-4 h-4" /> Rescue My Budget
          </Button>
          <Button variant="ghost" className="text-red-300 hover:text-red-200 hover:bg-red-500/10">
            Dismiss
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
